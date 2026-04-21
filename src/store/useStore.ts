// ─── i18n ─────────────────────────────────────────────────────────────────────
const langDict = {
  en: {
    // App
    appName: 'Marketing Funnel Architect',
    // Left sidebar sections
    discoveryChannels: 'Discovery Channels',
    landingPage: 'Landing Page',
    toolsVisuals: 'Tools & Visuals',
    marketingPresets: 'Marketing Presets',
    // Left sidebar items
    ads: 'Ads', googleAds: 'Google Ads', metaAds: 'Meta Ads', others: 'Others',
    email: 'Email', forms: 'Forms', social: 'Social', outdoorMedia: 'Outdoor Media',
    largeTitle: 'Large Title', marketingNotes: 'Marketing Notes', imageLogo: 'Image/Logo',
    square: 'Square', circle: 'Circle', line: 'Line', dotted: 'Dotted',
    browseTemplates: 'Browse Templates', saveAsPreset: '+ Save current as preset',
    // Header
    importJSON: 'Import JSON', exportLabel: 'Export',
    // Toolbar tooltips
    selectionTool: 'Selection Tool', handTool: 'Hand Tool',
    autoArrange: 'Auto Arrange', toggleMiniMap: 'Toggle MiniMap',
    searchNodes: 'Search nodes',
    // Right sidebar
    history: 'History', group: 'Group', ungroup: 'Ungroup',
    architectMode: 'Architect Mode', architectModeDesc: 'Select any component on the canvas to configure its O2O properties.',
    channelSelection: 'Channel Selection', nodeNameTitle: 'Node Name / Title',
    styleConfig: 'Style Configuration', visualAppearance: 'Visual Appearance',
    fillColor: 'Fill Color', borderColor: 'Border Color', borderThickness: 'Border Thickness',
    pageConfig: 'Page Configuration', pageTemplate: 'Page Template',
    mediaToolkit: 'Media Toolkit', addModule: 'Add Module',
    typographyLayout: 'Typography & Layout', alignment: 'Alignment',
    titleSize: 'Title Size', fontFamily: 'Font Family',
    spacingControls: 'Spacing Controls', letterSpacing: 'Letter Spacing', lineHeight: 'Line Height',
    livePreview: 'Live Preview',
    // Search
    searchPlaceholder: 'Search nodes... (Esc to close)',
    searchStart: 'Start typing to find a node on the canvas',
    searchNone: 'No nodes found',
    // Tour
    tourSkip: 'Skip tour', tourNext: 'Next', tourDone: 'Done!',
    tourStep1Title: 'Drag cards onto the canvas', tourStep1Body: 'Pick any channel from the left panel (Ads, Email, Social…) and drag it onto the canvas.',
    tourStep2Title: 'Connect cards', tourStep2Body: 'Hover a card to reveal its blue handles, then drag from a handle to another card to create a connection.',
    tourStep3Title: 'Configure each step', tourStep3Body: 'Click any card to open its settings on the right — add notes, change channel, and style your funnel.',
    tourStep4Title: 'Export your funnel', tourStep4Body: 'Use the Export button (top-right) to download as PNG, PDF or share as JSON.',
    // Templates modal
    chooseTemplate: 'Choose a Campaign Template',
    chooseTemplateDesc: 'Each template comes with a full funnel flow, descriptions and strategic notes on every card',
    viewTemplate: 'View template →', startBlank: '→ Start with blank canvas', cancel: 'Cancel',
    // Confirm
    confirmReplace: 'This will replace your current canvas. Continue?',
    // Footer
    footerCopyright: '©ryansham.martechtalks',
    // Context menu
    canvasActions: 'Canvas Actions', paste: 'Paste', fitView: 'Fit View',
    edgeActions: 'Edge Actions', removeConnection: 'Remove Connection',
    configureChannel: 'Configure Channel', resetContentStack: 'Reset Content Stack',
    selectionExport: 'Selection Export', downloadPNG: 'Download Selection as PNG',
    copyPNG: 'Copy Selection as PNG', copySelection: 'Copy Selection',
    duplicate: 'Duplicate', deleteSelection: 'Delete Selection',
    bringToTop: 'Bring to Top', sendToBack: 'Send to Back',
    // Note placeholder
    addNote: 'Add a note...',
  },
  'zh-hk': {
    appName: 'Marketing Funnel Architect',
    discoveryChannels: '探索頻道', landingPage: '著陸頁',
    toolsVisuals: '工具與視覺', marketingPresets: '行銷模板',
    ads: '廣告', googleAds: 'Google 廣告', metaAds: 'Meta 廣告', others: '其他',
    email: '電郵', forms: '表單', social: '社交媒體', outdoorMedia: '戶外媒體',
    largeTitle: '大標題', marketingNotes: '行銷備注', imageLogo: '圖片/標誌',
    square: '方形', circle: '圓形', line: '直線', dotted: '虛線',
    browseTemplates: '瀏覽模板', saveAsPreset: '+ 儲存為自訂模板',
    importJSON: '匯入 JSON', exportLabel: '匯出',
    selectionTool: '選擇工具', handTool: '手形工具',
    autoArrange: '自動排列', toggleMiniMap: '切換小地圖', searchNodes: '搜尋節點',
    history: '歷史記錄', group: '組合', ungroup: '取消組合',
    architectMode: '設計師模式', architectModeDesc: '選取畫布上的任何元素以設定其屬性。',
    channelSelection: '頻道選擇', nodeNameTitle: '節點名稱／標題',
    styleConfig: '樣式設定', visualAppearance: '視覺外觀',
    fillColor: '填充顏色', borderColor: '邊框顏色', borderThickness: '邊框粗細',
    pageConfig: '頁面設定', pageTemplate: '頁面模板',
    mediaToolkit: '媒體工具包', addModule: '新增模組',
    typographyLayout: '字型與排版', alignment: '對齊方式',
    titleSize: '標題大小', fontFamily: '字型',
    spacingControls: '間距控制', letterSpacing: '字距', lineHeight: '行距',
    livePreview: '即時預覽',
    searchPlaceholder: '搜尋節點… (Esc 關閉)',
    searchStart: '輸入以尋找畫布上的節點',
    searchNone: '找不到節點',
    tourSkip: '略過導覽', tourNext: '下一步', tourDone: '完成！',
    tourStep1Title: '拖曳卡片到畫布', tourStep1Body: '從左側面板選擇頻道（廣告、電郵、社交媒體等），拖曳到畫布上。',
    tourStep2Title: '連結卡片', tourStep2Body: '將滑鼠移到卡片上以顯示藍色連接點，從連接點拖曳到另一張卡片以建立連結。',
    tourStep3Title: '設定每個步驟', tourStep3Body: '點擊任何卡片以在右側開啟其設定 — 新增備注、更換頻道並設計漏斗。',
    tourStep4Title: '匯出你的漏斗', tourStep4Body: '使用右上角的「匯出」按鈕以 PNG、PDF 下載或以 JSON 分享。',
    chooseTemplate: '選擇活動模板',
    chooseTemplateDesc: '每個模板均附有完整漏斗流程、說明及每張卡片的策略備注',
    viewTemplate: '查看模板 →', startBlank: '→ 從空白畫布開始', cancel: '取消',
    confirmReplace: '此操作將取代目前畫布，確定繼續？',
    footerCopyright: '©ryansham.martechtalks',
    canvasActions: '畫布操作', paste: '貼上', fitView: '全圖顯示',
    edgeActions: '連線操作', removeConnection: '移除連線',
    configureChannel: '設定頻道', resetContentStack: '重設內容堆疊',
    selectionExport: '選取範圍匯出', downloadPNG: '以 PNG 下載選取範圍',
    copyPNG: '複製選取範圍為 PNG', copySelection: '複製選取',
    duplicate: '複製', deleteSelection: '刪除選取',
    bringToTop: '移至最前', sendToBack: '移至最後',
    addNote: '新增備注…',
  },
  'zh-cn': {
    appName: 'Marketing Funnel Architect',
    discoveryChannels: '探索渠道', landingPage: '落地页',
    toolsVisuals: '工具与视觉', marketingPresets: '营销模板',
    ads: '广告', googleAds: 'Google 广告', metaAds: 'Meta 广告', others: '其他',
    email: '邮件', forms: '表单', social: '社交媒体', outdoorMedia: '户外媒体',
    largeTitle: '大标题', marketingNotes: '营销备注', imageLogo: '图片/标志',
    square: '方形', circle: '圆形', line: '直线', dotted: '虚线',
    browseTemplates: '浏览模板', saveAsPreset: '+ 保存为自定义模板',
    importJSON: '导入 JSON', exportLabel: '导出',
    selectionTool: '选择工具', handTool: '手形工具',
    autoArrange: '自动排列', toggleMiniMap: '切换小地图', searchNodes: '搜索节点',
    history: '历史记录', group: '组合', ungroup: '取消组合',
    architectMode: '设计师模式', architectModeDesc: '选择画布上的任何元素以配置其属性。',
    channelSelection: '渠道选择', nodeNameTitle: '节点名称／标题',
    styleConfig: '样式配置', visualAppearance: '视觉外观',
    fillColor: '填充颜色', borderColor: '边框颜色', borderThickness: '边框粗细',
    pageConfig: '页面配置', pageTemplate: '页面模板',
    mediaToolkit: '媒体工具包', addModule: '添加模块',
    typographyLayout: '字体与排版', alignment: '对齐方式',
    titleSize: '标题大小', fontFamily: '字体',
    spacingControls: '间距控制', letterSpacing: '字距', lineHeight: '行距',
    livePreview: '实时预览',
    searchPlaceholder: '搜索节点… (Esc 关闭)',
    searchStart: '输入以查找画布上的节点',
    searchNone: '未找到节点',
    tourSkip: '跳过导览', tourNext: '下一步', tourDone: '完成！',
    tourStep1Title: '拖拽卡片到画布', tourStep1Body: '从左侧面板选择渠道（广告、邮件、社交媒体等），拖拽到画布上。',
    tourStep2Title: '连接卡片', tourStep2Body: '将鼠标移到卡片上显示蓝色连接点，从连接点拖拽到另一张卡片建立连接。',
    tourStep3Title: '配置每个步骤', tourStep3Body: '点击任意卡片在右侧打开设置 — 添加备注、更换渠道并设计漏斗。',
    tourStep4Title: '导出你的漏斗', tourStep4Body: '使用右上角的"导出"按钮以 PNG、PDF 下载或以 JSON 分享。',
    chooseTemplate: '选择活动模板',
    chooseTemplateDesc: '每个模板均附有完整漏斗流程、说明及每张卡片的策略备注',
    viewTemplate: '查看模板 →', startBlank: '→ 从空白画布开始', cancel: '取消',
    confirmReplace: '此操作将替换当前画布，确定继续？',
    footerCopyright: '©ryansham.martechtalks',
    canvasActions: '画布操作', paste: '粘贴', fitView: '全图显示',
    edgeActions: '连线操作', removeConnection: '移除连线',
    configureChannel: '配置渠道', resetContentStack: '重置内容堆叠',
    selectionExport: '选区导出', downloadPNG: '以 PNG 下载选区',
    copyPNG: '复制选区为 PNG', copySelection: '复制选区',
    duplicate: '复制', deleteSelection: '删除选区',
    bringToTop: '移至最前', sendToBack: '移至最后',
    addNote: '添加备注…',
  },
} as const;

export { langDict };

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
  theme: 'light',
  lang: (typeof localStorage !== 'undefined' ? localStorage.getItem('fa_lang') || 'en' : 'en') as 'en' | 'zh-hk' | 'zh-cn',
  t: langDict[(typeof localStorage !== 'undefined' ? (localStorage.getItem('fa_lang') as any) || 'en' : 'en') as keyof typeof langDict] || langDict['en'],
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
      sourceHandle: connection.sourceHandle || 'right',
      targetHandle: connection.targetHandle || 'left',
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
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
      style: { width: (maxX - minX) + padding * 2, height: (maxY - minY) + padding * 2, pointerEvents: 'none' as unknown as undefined },
      selectable: false,
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

  setTheme: (theme: 'dark' | 'light') => set({ theme }),
  setLang: (lang: 'en' | 'zh-hk' | 'zh-cn') => { localStorage.setItem('fa_lang', lang); set({ lang, t: langDict[lang] || langDict['en'] }); },

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
    // Exclude non-flow nodes from arrangement
    const arrangementExcludes = ['group', 'shape', 'title', 'text', 'image'];
    const cards = nodes.filter(n => !arrangementExcludes.includes(n.type || ''));
    const others = nodes.filter(n => arrangementExcludes.includes(n.type || ''));

    if (cards.length === 0) return;

    const positions = new Map<string, { x: number, y: number }>();

    // Linear layout: BFS left→right, then vertically center each column
    const colGap    = 320;   // horizontal gap between columns
    const rowGap    = 200;   // vertical gap between rows within a column
    const startX    = 100;

    const incomingCount = new Map<string, number>();
    edges.forEach(e => incomingCount.set(e.target, (incomingCount.get(e.target) || 0) + 1));

    const roots = cards.filter(n => !incomingCount.has(n.id));
    if (roots.length === 0 && cards.length > 0) roots.push(cards[0]);

    // BFS: assign each card a column and a slot within that column
    const colItems = new Map<number, string[]>(); // col → [nodeId, ...]
    const nodeCol  = new Map<string, number>();
    const processed = new Set<string>();
    const queue: Array<{ id: string; col: number }> = roots.map(r => ({ id: r.id, col: 0 }));

    while (queue.length > 0) {
      const { id, col } = queue.shift()!;
      if (processed.has(id)) continue;
      processed.add(id);
      nodeCol.set(id, col);
      if (!colItems.has(col)) colItems.set(col, []);
      colItems.get(col)!.push(id);

      edges
        .filter(e => e.source === id)
        .map(e => e.target)
        .filter(tid => cards.some(n => n.id === tid) && !processed.has(tid))
        .forEach(childId => queue.push({ id: childId, col: col + 1 }));
    }

    // Any unprocessed (disconnected) cards
    let extraCol = (colItems.size > 0 ? Math.max(...colItems.keys()) + 1 : 0);
    cards.forEach(n => {
      if (!processed.has(n.id)) {
        if (!colItems.has(extraCol)) colItems.set(extraCol, []);
        colItems.get(extraCol)!.push(n.id);
      }
    });

    // Now position: center each column's items around a common horizontal center line
    colItems.forEach((ids, col) => {
      const totalH = (ids.length - 1) * rowGap;   // total span
      const topY   = -totalH / 2;                  // start so items center on y=0
      ids.forEach((id, i) => {
        positions.set(id, {
          x: startX + col * colGap,
          y: 400 + topY + i * rowGap,
        });
      });
    });

    const arrangedCards = cards.map(node => ({
      ...node,
      position: positions.get(node.id) || node.position,
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
