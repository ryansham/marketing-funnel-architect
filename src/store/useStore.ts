import { create } from 'zustand';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges,
  MarkerType
} from 'reactflow';
import { AppState, MockupModule, NodeData, MarketingPreset } from '../types';

const PRESETS_KEY = 'marketing_presets';

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  history: [],
  historyIndex: -1,
  showNumbers: false,
  theme: 'light',
  interactionMode: 'select',
  isConnecting: false,
  presets: JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]'),
  clipboard: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  setIsConnecting: (val: boolean) => set({ isConnecting: val }),
  setInteractionMode: (mode: 'select' | 'pan') => set({ interactionMode: mode }),

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    // Check if edge already exists
    const existing = get().edges.find(e => e.source === connection.source && e.target === connection.target);
    if (existing) return;

    const edge = { 
      ...connection, 
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      animated: true,
      style: { stroke: get().theme === 'dark' ? '#64748b' : '#94a3b8' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: get().theme === 'dark' ? '#64748b' : '#94a3b8',
      },
      type: 'custom',
    };
    set({
      edges: addEdge(edge, get().edges),
    });
  },

  setNodes: (nodes: Node<NodeData>[]) => set({ nodes: [...nodes] }),
  setEdges: (edges: Edge[]) => set({ edges: [...edges] }),
  
  setSelectedNode: (id: string | null) => set({ selectedNodeId: id }),

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    
    // Limit history size to 50
    if (newHistory.length > 50) newHistory.shift();
    
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({ 
        nodes: JSON.parse(JSON.stringify(prevState.nodes)), 
        edges: JSON.parse(JSON.stringify(prevState.edges)),
        historyIndex: historyIndex - 1 
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({ 
        nodes: JSON.parse(JSON.stringify(nextState.nodes)), 
        edges: JSON.parse(JSON.stringify(nextState.edges)),
        historyIndex: historyIndex + 1 
      });
    }
  },

  updateNodeData: (id: string, data: Partial<NodeData>) => {
    const newNodes = get().nodes.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...data } };
      }
      return node;
    });
    set({ nodes: newNodes });
    // Note: We don't push history on every keystroke, usually called on blur or specific actions
    // But for simplicity in this tool, we might want to be careful.
  },

  deleteEdge: (edgeId: string) => {
    get().pushHistory();
    set({ edges: get().edges.filter(e => e.id !== edgeId) });
  },

  toggleEdgeBidirectional: (edgeId: string) => {
    get().pushHistory();
    const edges = get().edges.map(e => {
      if (e.id === edgeId) {
        const isBidirectional = !e.markerStart;
        return {
          ...e,
          markerStart: isBidirectional ? {
            type: MarkerType.ArrowClosed,
            color: get().theme === 'dark' ? '#64748b' : '#94a3b8',
          } : undefined
        };
      }
      return e;
    });
    set({ edges });
  },

  deleteSelection: () => {
    const selectedNodes = get().nodes.filter(n => n.selected);
    const selectedEdges = get().edges.filter(e => e.selected);
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
    
    get().pushHistory();
    const nodeIds = selectedNodes.map(n => n.id);
    
    set({
      nodes: get().nodes.filter(n => !n.selected),
      edges: get().edges.filter(e => !e.selected && !nodeIds.includes(e.source) && !nodeIds.includes(e.target))
    });
  },

  copySelection: () => {
    const selectedNodes = get().nodes.filter(n => n.selected);
    if (selectedNodes.length === 0) return;

    const nodeIds = selectedNodes.map(n => n.id);
    const selectedEdges = get().edges.filter(e => e.selected || (nodeIds.includes(e.source) && nodeIds.includes(e.target)));

    set({
      clipboard: {
        nodes: JSON.parse(JSON.stringify(selectedNodes)),
        edges: JSON.parse(JSON.stringify(selectedEdges))
      }
    });
  },

  pasteSelection: () => {
    const { clipboard, nodes, edges } = get();
    if (!clipboard) return;

    get().pushHistory();

    const idMap: Record<string, string> = {};
    const offset = 40;

    const newNodes = clipboard.nodes.map(node => {
      const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      idMap[node.id] = newId;
      return {
        ...node,
        id: newId,
        selected: true,
        position: { x: node.position.x + offset, y: node.position.y + offset }
      } as Node<NodeData>;
    });

    const deselectNodes = nodes.map(n => ({ ...n, selected: false }));

    const newEdges = clipboard.edges.map(edge => {
      if (!idMap[edge.source] || !idMap[edge.target]) return null;
      const newId = `e-${idMap[edge.source]}-${idMap[edge.target]}-${Date.now()}`;
      return {
        ...edge,
        id: newId,
        source: idMap[edge.source],
        target: idMap[edge.target],
        selected: true
      } as Edge;
    }).filter(e => e !== null) as Edge[];

    const deselectEdges = edges.map(e => ({ ...e, selected: false }));

    set({
      nodes: [...deselectNodes, ...newNodes],
      edges: [...deselectEdges, ...newEdges]
    });
  },

  duplicateSelection: () => {
    get().copySelection();
    get().pasteSelection();
  },

  selectAll: () => {
    set({
      nodes: get().nodes.map(n => ({ ...n, selected: true })),
      edges: get().edges.map(e => ({ ...e, selected: true }))
    });
  },

  clearSelection: () => {
    set({
      nodes: get().nodes.map(n => ({ ...n, selected: false })),
      edges: get().edges.map(e => ({ ...e, selected: false }))
    });
  },

  createGroup: (nodeIds: string[]) => {
    if (nodeIds.length === 0) return;
    get().pushHistory();
    
    const nodes = get().nodes;
    const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));
    
    // Calculate bounding box
    const minX = Math.min(...selectedNodes.map(n => n.position.x));
    const minY = Math.min(...selectedNodes.map(n => n.position.y));
    const maxX = Math.max(...selectedNodes.map(n => n.position.x + (n.width || 200)));
    const maxY = Math.max(...selectedNodes.map(n => n.position.y + (n.height || 100)));
    
    const padding = 40;
    const groupId = `group-${Date.now()}`;
    
    const groupNode: Node<NodeData> = {
      id: groupId,
      type: 'group',
      position: { x: minX - padding, y: minY - padding },
      style: { width: (maxX - minX) + padding * 2, height: (maxY - minY) + padding * 2 },
      data: { label: 'New Group', type: 'group', volume: 0, ctr: 0, cpc: 0 }
    };

    const updatedNodes = nodes.map(n => {
      if (nodeIds.includes(n.id)) {
        return {
          ...n,
          parentId: groupId,
          position: {
            x: n.position.x - (minX - padding),
            y: n.position.y - (minY - padding)
          },
          extent: 'parent' as const
        };
      }
      return n;
    });

    set({ nodes: [groupNode, ...updatedNodes] });
  },

  ungroup: (groupId: string) => {
    get().pushHistory();
    const { nodes } = get();
    const groupNode = nodes.find(n => n.id === groupId);
    if (!groupNode) return;

    const updatedNodes = nodes.filter(n => n.id !== groupId).map(n => {
      if (n.parentId === groupId) {
        return {
          ...n,
          parentId: undefined,
          position: {
            x: n.position.x + groupNode.position.x,
            y: n.position.y + groupNode.position.y
          },
          extent: undefined
        };
      }
      return n;
    });

    set({ nodes: updatedNodes });
  },

  toggleNumbers: () => set({ showNumbers: !get().showNumbers }),
  setTheme: (theme: 'dark' | 'light') => set({ theme }),

  importCampaign: (data: { nodes: any[]; edges: any[] }) => {
    get().pushHistory();
    set({
      nodes: data.nodes,
      edges: data.edges,
      selectedNodeId: null
    });
  },

  arrangeGrid: (mode: 'grid' | 'horizontal' | 'vertical' | 'circular' = 'grid') => {
    get().pushHistory();
    const { nodes, edges } = get();
    const arrangementExcludes = ['group'];
    const cards = nodes.filter(n => !arrangementExcludes.includes(n.type || ''));
    const others = nodes.filter(n => arrangementExcludes.includes(n.type || ''));
    
    if (cards.length === 0) return;

    const positions = new Map<string, { x: number, y: number }>();

    if (mode === 'grid') {
      const colWidth = 320;
      const rowHeight = 300;
      const margin = 100;

      const incomingEdgeCounts = new Map<string, number>();
      edges.forEach(e => {
        incomingEdgeCounts.set(e.target, (incomingEdgeCounts.get(e.target) || 0) + 1);
      });

      const roots = cards.filter(n => !incomingEdgeCounts.has(n.id));
      const processed = new Set<string>();
      let currentRow = 0;

      const arrangeBranch = (nodeId: string, col: number, row: number) => {
        if (processed.has(nodeId)) return;
        processed.add(nodeId);
        positions.set(nodeId, { x: col * colWidth + margin, y: row * rowHeight + margin });
        const children = edges.filter(e => e.source === nodeId).map(e => e.target).filter(id => cards.some(n => n.id === id));
        children.forEach((childId, i) => arrangeBranch(childId, col + 1, row + i));
      };

      roots.forEach((root, i) => {
        arrangeBranch(root.id, 0, currentRow + i);
        currentRow += 1;
      });
      cards.forEach(n => {
        if (!processed.has(n.id)) {
          arrangeBranch(n.id, 0, currentRow);
          currentRow += 1;
        }
      });
    } else if (mode === 'horizontal') {
      cards.forEach((n, i) => positions.set(n.id, { x: i * 350 + 100, y: 100 }));
    } else if (mode === 'vertical') {
      cards.forEach((n, i) => positions.set(n.id, { x: 100, y: i * 250 + 100 }));
    } else if (mode === 'circular') {
      const radius = Math.max(400, cards.length * 80);
      const centerX = radius + 200;
      const centerY = radius + 200;
      cards.forEach((n, i) => {
         const angle = (i / cards.length) * 2 * Math.PI;
         positions.set(n.id, {
           x: centerX + radius * Math.cos(angle),
           y: centerY + radius * Math.sin(angle)
         });
      });
    }

    const arrangedCards = cards.map(node => ({
        ...node,
        position: positions.get(node.id) || node.position
    }));

    set({ nodes: [...arrangedCards, ...others] });
  },

  addMockupModule: (nodeId: string, module: MockupModule) => {
    get().pushHistory();
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;

    const currentModules = node.data.mockupModules || [];
    const newModules = [...currentModules, module];
    
    set({
      nodes: get().nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, mockupModules: newModules } } : n)
    });
  },

  updateMockupModules: (nodeId: string, modules: MockupModule[]) => {
    get().pushHistory();
    get().updateNodeData(nodeId, { mockupModules: modules });
  },

  reorderMockupModule: (nodeId: string, moduleId: string, direction: 'up' | 'down') => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node || !node.data.mockupModules) return;

    const modules = [...node.data.mockupModules];
    const index = modules.findIndex(m => m.id === moduleId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    [modules[index], modules[newIndex]] = [modules[newIndex], modules[index]];
    get().updateMockupModules(nodeId, modules);
  },

  renameMockupModule: (nodeId: string, moduleId: string, newLabel: string) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node || !node.data.mockupModules) return;

    const modules = node.data.mockupModules.map(m => 
      m.id === moduleId ? { ...m, label: newLabel } : m
    );
    get().updateMockupModules(nodeId, modules);
  },

  bringToFront: (id: string) => {
    const { nodes } = get();
    const nodeIndex = nodes.findIndex(n => n.id === id);
    if (nodeIndex === -1) return;
    
    get().pushHistory();
    const newNodes = [...nodes];
    const [node] = newNodes.splice(nodeIndex, 1);
    newNodes.push(node);
    set({ nodes: [...newNodes] });
  },

  sendToBack: (id: string) => {
    const { nodes } = get();
    const nodeIndex = nodes.findIndex(n => n.id === id);
    if (nodeIndex === -1) return;

    get().pushHistory();
    const newNodes = [...nodes];
    const [node] = newNodes.splice(nodeIndex, 1);
    newNodes.unshift(node);
    set({ nodes: [...newNodes] });
  },

  saveCurrentAsPreset: (name: string) => {
    const { nodes, edges, presets } = get();
    const newPreset: MarketingPreset = {
      id: `preset-${Date.now()}`,
      name,
      nodes,
      edges
    };
    const newPresets = [...presets, newPreset];
    localStorage.setItem(PRESETS_KEY, JSON.stringify(newPresets));
    set({ presets: newPresets });
  },

  loadPreset: (id: string) => {
    const preset = get().presets.find(p => p.id === id);
    if (preset) {
      get().pushHistory();
      
      const idMap: Record<string, string> = {};
      const offset = 100;

      const newNodes = preset.nodes.map(node => {
        const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        idMap[node.id] = newId;
        return {
          ...node,
          id: newId,
          selected: true,
          position: { x: node.position.x + offset, y: node.position.y + offset }
        } as Node<NodeData>;
      });

      const newEdges = preset.edges.map(edge => {
        if (!idMap[edge.source] || !idMap[edge.target]) return null;
        const newId = `e-${idMap[edge.source]}-${idMap[edge.target]}-${Date.now()}`;
        return {
          ...edge,
          id: newId,
          source: idMap[edge.source],
          target: idMap[edge.target],
          selected: true
        } as Edge;
      }).filter(e => e !== null) as Edge[];

      // Deselect current
      const deselectNodes = get().nodes.map(n => ({ ...n, selected: false }));
      const deselectEdges = get().edges.map(e => ({ ...e, selected: false }));

      set({
        nodes: [...deselectNodes, ...newNodes],
        edges: [...deselectEdges, ...newEdges],
        selectedNodeId: null
      });
    }
  },

  deletePreset: (id: string) => {
    const newPresets = get().presets.filter(p => p.id !== id);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(newPresets));
    set({ presets: newPresets });
  }
}));
