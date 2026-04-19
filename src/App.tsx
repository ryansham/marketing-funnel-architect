import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Panel,
  EdgeLabelRenderer,
  BaseEdge,
  getBezierPath,
  EdgeProps,
  BackgroundVariant,
  SelectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore } from './store/useStore';
import { MarketingNode, LandingPageNode, StickyNoteNode, FreeTextNode, TitleNode, ImageNode, ShapeNode, GroupNode, CustomEdge } from './components/NodeTypes';
import Sidebar from './components/Sidebar';
import MockupPreview from './components/MockupPreview';
import { NodeType, SocialChannel, ShapeType } from './types';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import * as LucideIcons from 'lucide-react';
import { 
  Plus, 
  Database, 
  Share2, 
  MousePointer2, 
  Layers,
  Search,
  MessageSquare,
  Globe,
  Store,
  Smartphone,
  QrCode,
  LayoutGrid,
  Eye,
  EyeOff,
  Download,
  StickyNote,
  ExternalLink,
  Facebook,
  Instagram,
  Youtube,
  Type,
  Sun,
  Moon,
  Upload,
  ChevronRight,
  ChevronDown,
  Bus,
  Train,
  TramFront,
  Mail,
  ClipboardList,
  Heading1,
  Image
} from 'lucide-react';
import { cn } from './lib/utils';

const nodeTypes = {
  marketing: MarketingNode,
  landing: LandingPageNode,
  sticky: StickyNoteNode,
  text: FreeTextNode,
  title: TitleNode,
  image: ImageNode,
  shape: ShapeNode,
  group: GroupNode
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: any[] = [];
const initialEdges: any[] = [];

export default function App() {
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setSelectedNode,
    selectedNodeId,
    setNodes,
    setEdges,
    showNumbers,
    toggleNumbers,
    arrangeGrid,
    theme,
    setTheme,
    interactionMode,
    setInteractionMode,
    setIsConnecting,
    importCampaign,
    presets,
    saveCurrentAsPreset,
    loadPreset,
    copySelection,
    pasteSelection,
    duplicateSelection,
    deleteSelection,
    undo,
    redo,
    pushHistory,
    createGroup,
    ungroup
  } = useStore();

  const [spawnOffset, setSpawnOffset] = React.useState(0);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [menu, setMenu] = useState<{ id?: string, type?: string, top?: number, left?: number, right?: number, bottom?: number } | null>(null);

  // Initialize: load autosave if exists, otherwise create default sequence
  React.useEffect(() => {
    const saved = localStorage.getItem('funnel_architect_autosave');
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        if (savedNodes && savedNodes.length > 0) {
          importCampaign({ nodes: savedNodes, edges: savedEdges });
          return; // don't create default if we have a save
        }
      } catch (err) {
        console.error('Failed to load auto-save', err);
      }
    }
    createDefaultSequence();
  }, []);

  // Auto-save to LocalStorage every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const { nodes: n, edges: e } = useStore.getState();
      if (n.length > 0) {
        localStorage.setItem('funnel_architect_autosave', JSON.stringify({ nodes: n, edges: e }));
      }
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(true);

      // Higher priority Ctrl+G handling
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const selectedIds = useStore.getState().nodes.filter(n => n.selected).map(n => n.id);
        if (selectedIds.length > 1) {
          useStore.getState().createGroup(selectedIds);
          return;
        }
      }

      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable) {
        return;
      }

      if (e.key === 'v' || e.key === 'V') {
        setInteractionMode('select');
      }
      if (e.key === 'h' || e.key === 'H') {
        setInteractionMode('pan');
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copySelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteSelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelection();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only prevent default if we actually have a selection to delete
        // to avoid breaking browser back behavior if that's what they expect (though rare now)
        // Actually, always prevent to be safe on canvas
        const hasSelection = nodes.some(n => n.selected) || edges.some(e => e.selected);
        if (hasSelection) {
          e.preventDefault();
          deleteSelection();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        useStore.getState().selectAll();
      }
      if (e.key === 'Escape') {
        useStore.getState().clearSelection();
        setMenu(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          // Ungroup
          const selected = nodes.filter(n => n.selected);
          selected.forEach(n => {
            if (n.parentId) ungroup(n.parentId);
            if (n.type === 'group') ungroup(n.id);
          });
        } else {
          // Group
          const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
          if (selectedIds.length > 1) createGroup(selectedIds);
          else if (selectedNodeId) createGroup([selectedNodeId]);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleExportJSON();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [copySelection, pasteSelection, duplicateSelection, deleteSelection, undo, redo]);

  // Area Selection Helper
  const selectedNodes = nodes.filter(n => n.selected);
  const showGroupPanel = selectedNodes.length > 1;

  const handleExportSelection = async (mode: 'download' | 'clipboard') => {
    const selectedNodes = nodes.filter(n => n.selected);
    const renderer = document.querySelector('.react-flow__viewport') as HTMLElement;
    const container = document.querySelector('.react-flow') as HTMLElement;
    
    if (!renderer || selectedNodes.length === 0) {
      alert('Please select at least one node to export.');
      return;
    }

    try {
      container.classList.add('is-exporting');
      const { toPng, toBlob } = await import('html-to-image');
      
      // Calculate bounding box of selection
      const padding = 40;
      const minX = Math.min(...selectedNodes.map(n => n.position.x));
      const minY = Math.min(...selectedNodes.map(n => n.position.y));
      const maxX = Math.max(...selectedNodes.map(n => n.position.x + (n.width ?? 220)));
      const maxY = Math.max(...selectedNodes.map(n => n.position.y + (n.height ?? 100)));
      
      const width = (maxX - minX) + padding * 2;
      const height = (maxY - minY) + padding * 2;

      const options = {
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
        },
      };

      if (mode === 'clipboard') {
        const blob = await toBlob(renderer, options);
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('Polished selection copied to clipboard');
        }
      } else {
        const dataUrl = await toPng(renderer, options);
        const link = document.createElement('a');
        link.download = `funnel-architect-selection-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      container.classList.remove('is-exporting');
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      setMenu({
        id: node.id,
        type: node.type,
        top: event.clientY,
        left: event.clientX,
      });
    },
    [setMenu]
  );

  const onPaneContextMenu = useCallback(
     (event: React.MouseEvent) => {
        event.preventDefault();
        setMenu({
          top: event.clientY,
          left: event.clientX,
        });
     },
     [setMenu]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: any) => {
      event.preventDefault();
      setMenu({
        id: edge.id,
        type: 'edge',
        top: event.clientY,
        left: event.clientX,
      });
    },
    [setMenu]
  );

  const addNode = (type: NodeType, label: string, reactFlowType: string = 'marketing', extraData: any = {}) => {
    const xBase = 150;
    const yBase = 150;
    const offset = spawnOffset * 40;

    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: reactFlowType,
      position: { x: xBase + offset, y: yBase + offset },
      data: { 
        label, 
        type, 
        icon: '', 
        volume: 5000, 
        ctr: 5, 
        cpc: 0.5, 
        physicalDropoff: 20,
        channels: [],
        primaryChannel: (type === 'discovery' ? (extraData.primaryChannel || 'others') : undefined) as any,
        fontFamily: reactFlowType === 'text' ? 'Dancing Script' : (reactFlowType === 'title' ? 'Montserrat' : undefined),
        fontSize: reactFlowType === 'text' ? 24 : undefined,
        note: '',
        fillColor: reactFlowType === 'shape' ? '#38bdf8' : undefined,
        strokeColor: reactFlowType === 'shape' ? '#38bdf8' : undefined,
        strokeWidth: reactFlowType === 'shape' ? 2 : undefined,
        ...extraData
      },
    };
    setNodes([...nodes, newNode]);
    setSpawnOffset((spawnOffset + 1) % 10);
  };

  const createDefaultSequence = () => {
    const timestamp = Date.now();
    const fbId = 'preset-fb-' + timestamp;
    const landingId = 'preset-lp-' + timestamp;
    const formId = 'preset-form-' + timestamp;
    const emailId = 'preset-email-' + timestamp;
    const groupId = 'group-preset-' + timestamp;

    const basePos = { x: 100, y: 100 };

    const groupNode = {
      id: groupId,
      type: 'group',
      position: basePos,
      style: { width: 1250, height: 350 },
      data: { label: 'Social Acquisition Flow', type: 'group' }
    };

    const newNodes: any[] = [
      groupNode,
      { id: fbId, parentId: groupId, extent: 'parent', type: 'marketing', position: { x: 40, y: 100 }, data: { label: 'Facebook Ads', type: 'discovery', primaryChannel: 'facebook', volume: 10000, ctr: 3, cpc: 0.5 } },
      { id: landingId, parentId: groupId, extent: 'parent', type: 'landing', position: { x: 350, y: 100 }, data: { label: 'Campaign Page', type: 'owned', pageType: 'Static Page', mockupModules: [{ id: 'm1', type: 'Hero', content: {} }, { id: 'm2', type: 'CTA', content: {} }, { id: 'm3', type: 'Subscription', content: {} }] } },
      { id: formId, parentId: groupId, extent: 'parent', type: 'marketing', position: { x: 650, y: 100 }, data: { label: 'Registration Form', type: 'discovery', primaryChannel: 'form', volume: 0, ctr: 0, cpc: 0 } },
      { id: emailId, parentId: groupId, extent: 'parent', type: 'marketing', position: { x: 950, y: 100 }, data: { label: 'Email Confirmation', type: 'discovery', primaryChannel: 'email', volume: 0, ctr: 0, cpc: 0 } },
    ];

    const newEdges = [
      { id: `e-${fbId}-${landingId}`, source: fbId, target: landingId, animated: true, type: 'custom' },
      { id: `e-${landingId}-${formId}`, source: landingId, target: formId, animated: true, type: 'custom' },
      { id: `e-${formId}-${emailId}`, source: formId, target: emailId, animated: true, type: 'custom' },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleExportJSON = () => {
    const dataString = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    saveAs(blob, 'o2o-campaign.json');
  };

  const saveAs = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        importCampaign(data);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleExportImage = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!reactFlowWrapper.current) return;
    
    // Select the viewport for clean capture
    const element = reactFlowWrapper.current.querySelector('.react-flow__viewport') as HTMLElement;
    if (!element) return;

    try {
      const bgColor = theme === 'dark' ? '#020617' : '#f8fafc';
      if (format === 'png') {
        const dataUrl = await toPng(reactFlowWrapper.current, { backgroundColor: bgColor });
        const link = document.createElement('a');
        link.download = 'o2o-campaign.png';
        link.href = dataUrl;
        link.click();
      } else if (format === 'jpg') {
        const dataUrl = await toJpeg(reactFlowWrapper.current, { backgroundColor: bgColor, quality: 0.95 });
        const link = document.createElement('a');
        link.download = 'o2o-campaign.jpg';
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const dataUrl = await toPng(reactFlowWrapper.current, { backgroundColor: bgColor });
        const pdf = new jsPDF('l', 'px', [reactFlowWrapper.current.clientWidth, reactFlowWrapper.current.clientHeight]);
        pdf.addImage(dataUrl, 'PNG', 0, 0, reactFlowWrapper.current.clientWidth, reactFlowWrapper.current.clientHeight);
        pdf.save('o2o-campaign.pdf');
      }
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className={cn(
      "grid grid-cols-[260px_1fr_320px] grid-rows-[60px_1fr_50px] h-screen w-screen overflow-hidden font-sans transition-colors duration-500",
      theme === 'dark' ? "bg-slate-950 text-slate-100 dark" : "bg-[#F0EBE1] text-slate-900 light"
    )}>
      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportJSON} 
        accept=".json" 
        className="hidden" 
      />

      {/* Header */}
      <header className={cn(
        "col-span-full border-b flex items-center justify-between px-6 z-50",
        theme === 'dark' ? "bg-sidebar border-border" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-3">
          <div className="font-display font-black text-lg tracking-tight" style={{ fontFamily: 'Montserrat' }}>
            Marketing Funnel Architect
          </div>
          <div className="h-4 w-[1px] bg-border mx-2 opacity-20" />
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "p-2 rounded-full transition-all",
              theme === 'dark' ? "bg-white/5 text-yellow-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            )}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn(
            "flex rounded-lg border overflow-hidden",
            theme === 'dark' ? "bg-white/5 border-border" : "bg-white border-slate-200 shadow-sm"
          )}>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-[11px] font-bold hover:bg-black/5 flex items-center gap-2 border-r border-border"
              >
                <Upload size={12} /> Import JSON
              </button>
              <div className="relative group">
                <button className="px-3 py-1.5 text-[11px] font-bold hover:bg-black/5 flex items-center gap-2">
                  <Download size={12} /> Export <ChevronDown size={10} />
                </button>
                <div className={cn(
                  "absolute top-full right-0 mt-1 border rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all w-32 py-1 overflow-hidden z-[100]",
                  theme === 'dark' ? "bg-sidebar border-border" : "bg-white border-slate-200 shadow-xl"
                )}>
                   <ExportOption label="JSON" onClick={handleExportJSON} theme={theme} />
                   <div className="h-[1px] bg-border mx-2 opacity-20" />
                   <ExportOption label="PNG Image" onClick={() => handleExportImage('png')} theme={theme} />
                   <ExportOption label="JPG Image" onClick={() => handleExportImage('jpg')} theme={theme} />
                   <ExportOption label="PDF Document" onClick={() => handleExportImage('pdf')} theme={theme} />
                </div>
              </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Toolkit */}
      <aside className={cn(
        "border-r p-6 flex flex-col gap-6 overflow-y-auto relative z-40",
        theme === 'dark' ? "bg-sidebar border-border" : "bg-white border-slate-200"
      )}>
        <section>
          <span className="text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 block opacity-50">Discovery Channels</span>
          <div className="space-y-2">
            <ToolkitItem 
              icon={Search} 
              label="Ads" 
              color="bg-discovery" 
              active={activeMenu === 'ads'}
              hasSubmenu
              onClick={() => setActiveMenu(activeMenu === 'ads' ? null : 'ads')} 
              theme={theme}
            />
            {activeMenu === 'ads' && (
              <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                 <SubToolkitItem label="Google Ads" onClick={() => addNode('discovery', 'Google Ads', 'marketing', { primaryChannel: 'google-ads' })} theme={theme} />
                 <SubToolkitItem label="Meta Ads" onClick={() => addNode('discovery', 'Meta Ads', 'marketing', { primaryChannel: 'facebook' })} theme={theme} />
                 <SubToolkitItem label="Others" onClick={() => addNode('discovery', 'Other Ads', 'marketing', { primaryChannel: 'others' })} theme={theme} />
              </div>
            )}
            <ToolkitItem 
              icon={Mail} 
              label="Email" 
              color="bg-discovery" 
              onClick={() => addNode('discovery', 'Email', 'marketing', { primaryChannel: 'email' })} 
              theme={theme}
            />
            <ToolkitItem 
              icon={ClipboardList} 
              label="Forms" 
              color="bg-discovery" 
              onClick={() => addNode('discovery', 'Form', 'marketing', { primaryChannel: 'form' })} 
              theme={theme}
            />
            <ToolkitItem 
              icon={Share2} 
              label="Social" 
              color="bg-discovery" 
              hasSubmenu 
              active={activeMenu === 'social'}
              onClick={() => setActiveMenu(activeMenu === 'social' ? null : 'social')}
              theme={theme}
            />
            {activeMenu === 'social' && (
              <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                {['facebook', 'instagram', 'youtube', 'whatsapp', 'tiktok', 'wechat'].map(ch => (
                   <SubToolkitItem 
                    key={ch}
                    label={ch.charAt(0).toUpperCase() + ch.slice(1)} 
                    onClick={() => addNode('discovery', ch.charAt(0).toUpperCase() + ch.slice(1), 'marketing', { primaryChannel: ch })} 
                    theme={theme}
                  />
                ))}
              </div>
            )}

            <ToolkitItem 
              icon={Store} 
              label="Outdoor Media" 
              color="bg-physical" 
              hasSubmenu
              active={activeMenu === 'outdoor'}
              onClick={() => setActiveMenu(activeMenu === 'outdoor' ? null : 'outdoor')} 
              theme={theme}
            />
            {activeMenu === 'outdoor' && (
              <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <OutdoorSubMenu onClick={(label) => addNode('physical', label, 'marketing', { primaryChannel: 'outdoor' })} theme={theme} />
              </div>
            )}
             <ToolkitItem 
              icon={Plus} 
              label="Others" 
              color="bg-slate-400" 
              onClick={() => addNode('discovery', 'Other Source', 'marketing', { primaryChannel: 'others' })} 
              theme={theme}
            />
          </div>
        </section>

        <section>
          <span className="text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 block opacity-50">Landing Page</span>
          <div className="space-y-2">
            <ToolkitItem icon={Globe} label="Landing Page" color="bg-owned" onClick={() => addNode('owned', 'Campaign Page', 'landing', { pageType: 'Static Page', mockupModules: [{ id: 'm1', type: 'Hero' }, { id: 'm2', type: 'CTA' }, { id: 'm3', type: 'Subscription' }] })} theme={theme} />
          </div>
        </section>

        <section>
          <span className="text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 block opacity-50">Tools & Visuals</span>
          <div className="space-y-2">
            <ToolkitItem icon={Heading1} label="Large Title" color="bg-accent" onClick={() => addNode('title', 'Headline', 'title', { titleType: 'h1', textAlign: 'center', label2: 'Objective: ' })} theme={theme} />
            <ToolkitItem icon={Type} label="Marketing Notes" color="bg-slate-400" onClick={() => addNode('text', 'Marketing notes...', 'text', { fontFamily: 'Roboto', fontSize: 18 })} theme={theme} />
            <ToolkitItem icon={Image} label="Image/logo" color="bg-white" onClick={() => addNode('image', '', 'image')} theme={theme} />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
             <button 
                onClick={() => addNode('shape', 'Square', 'shape', { shapeType: 'square' as ShapeType, strokeWidth: 2, strokeColor: '#38bdf8', fillColor: '#38bdf8' })}
                className={cn("flex items-center gap-2 p-2 border rounded-lg text-[9px] font-bold transition-all", theme === 'dark' ? "bg-white/5 border-border text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}
             >
                <LucideIcons.Square size={12} /> Square
             </button>
             <button 
                onClick={() => addNode('shape', 'Circle', 'shape', { shapeType: 'circle' as ShapeType, strokeWidth: 2, strokeColor: '#38bdf8', fillColor: '#38bdf8' })}
                className={cn("flex items-center gap-2 p-2 border rounded-lg text-[9px] font-bold transition-all", theme === 'dark' ? "bg-white/5 border-border text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}
             >
                <LucideIcons.Circle size={12} /> Circle
             </button>
             <button 
                onClick={() => addNode('shape', 'Line', 'shape', { shapeType: 'line' as ShapeType, strokeWidth: 2, strokeColor: '#38bdf8' })}
                className={cn("flex items-center gap-2 p-2 border rounded-lg text-[9px] font-bold transition-all", theme === 'dark' ? "bg-white/5 border-border text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}
             >
                <LucideIcons.Minus size={12} /> Line
             </button>
             <button 
                onClick={() => addNode('shape', 'Dotted', 'shape', { shapeType: 'dotted-line' as ShapeType, strokeWidth: 2, strokeColor: '#38bdf8' })}
                className={cn("flex items-center gap-2 p-2 border rounded-lg text-[9px] font-bold transition-all", theme === 'dark' ? "bg-white/5 border-border text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}
             >
                <LucideIcons.MoreHorizontal size={12} /> Dotted
             </button>
          </div>
        </section>

        <section className="mt-auto pt-6 border-t border-border/10">
          <span className="text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 block opacity-50">Marketing Presets</span>
          <div className="space-y-2">
            <ToolkitItem 
              icon={Layers} 
              label="Social Flow" 
              color="bg-accent" 
              onClick={createDefaultSequence} 
              theme={theme} 
            />
            {presets.map(p => (
              <ToolkitItem 
                key={p.id} 
                icon={Database} 
                label={p.name} 
                color="bg-slate-500" 
                onClick={() => loadPreset(p.id)} 
                theme={theme} 
              />
            ))}
            <button 
              onClick={() => {
                const name = prompt('Enter preset name:');
                if (name) saveCurrentAsPreset(name);
              }}
              className="w-full py-2 border border-dashed border-border rounded-lg text-[10px] font-black uppercase opacity-50 hover:opacity-100 transition-opacity"
            >
              + Save current as preset
            </button>
          </div>
        </section>
      </aside>
      
      {/* Main Canvas Area */}
      <main className="relative h-full w-full overflow-hidden" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={() => setIsConnecting(true)}
          onConnectEnd={() => setIsConnecting(false)}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeDragStart={pushHistory}
          onSelectionDragStart={pushHistory}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          snapToGrid={true}
          snapGrid={[15, 15]}
          fitView
          panOnDrag={interactionMode === 'pan' || isSpacePressed}
          selectionOnDrag={interactionMode === 'select' && !isSpacePressed}
          selectionMode={SelectionMode.Partial}
          panOnScroll={true}
          panOnScrollMode={undefined} // Allows both
          style={{ background: 'transparent' }}
        >
          <Background 
            color={theme === 'dark' ? "#1e293b" : "#cbd5e1"} 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
          />

          <Panel position="bottom-left" className="flex items-end gap-2 mb-2 ml-2">
             <div className={cn(
               "flex flex-col rounded-xl border p-1 border-border shadow-2xl overflow-hidden",
               theme === 'dark' ? "bg-slate-900" : "bg-white"
             )}>
                <button 
                  onClick={() => setInteractionMode('select')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    interactionMode === 'select' ? "bg-accent text-bg shadow-lg" : "text-text-dim hover:bg-black/5"
                  )}
                  title="Selection Tool (V)"
                >
                  <LucideIcons.MousePointer2 size={18} />
                </button>
                <div className="h-[1px] bg-border my-1 mx-1 opacity-20" />
                <button 
                  onClick={() => setInteractionMode('pan')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    interactionMode === 'pan' ? "bg-accent text-bg shadow-lg" : "text-text-dim hover:bg-black/5"
                  )}
                  title="Hand Tool (H / Space)"
                >
                  <LucideIcons.Hand size={18} />
                </button>
             </div>

             <Controls className={cn(
               "!static !m-0 !rounded-xl !border !shadow-2xl !overflow-hidden !flex !flex-col-reverse",
               theme === 'dark' ? "!bg-slate-900 !border-border !fill-white" : "!bg-white !border-slate-200 !fill-slate-600"
             )} />
          </Panel>

          {showGroupPanel && (
            <Panel position="top-center" className="animate-in fade-in slide-in-from-top-4">
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-xl shadow-2xl border",
                theme === 'dark' ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
              )}>
                 <span className="text-[10px] font-black uppercase px-2 text-text-dim">Selection: {selectedNodes.length}</span>
                 <button 
                  onClick={() => createGroup(selectedNodes.map(n => n.id))}
                  className="flex items-center gap-2 px-3 py-1.5 bg-accent text-bg rounded-lg text-[10px] font-bold hover:scale-105 transition-transform"
                 >
                    <Layers size={14} /> Group Selection
                 </button>
              </div>
            </Panel>
          )}
          
          <Panel position="top-right" className={cn(
            "flex gap-2 p-1.5 backdrop-blur rounded-xl border shadow-2xl m-4",
            theme === 'dark' ? "bg-sidebar/80 border-border" : "bg-white/80 border-slate-200"
          )}>
            <div className="relative group/arrange">
              <ToolbarBtn 
                icon={LayoutGrid} 
                label="Arrange" 
                theme={theme}
              />
              <div className={cn(
                "absolute top-full right-0 mt-1 p-1 border rounded-xl shadow-2xl opacity-0 scale-95 group-hover/arrange:opacity-100 group-hover/arrange:scale-100 transition-all pointer-events-none group-hover/arrange:pointer-events-auto w-32 z-[100]",
                theme === 'dark' ? "bg-slate-950 border-white/10" : "bg-white border-slate-200"
              )}>
                 {['grid', 'horizontal', 'vertical', 'circular'].map(mode => (
                   <button 
                    key={mode} 
                    onClick={() => arrangeGrid(mode as any)}
                    className="w-full text-left px-3 py-2 text-[10px] font-black uppercase hover:bg-accent hover:text-bg rounded-lg transition-colors"
                   >
                     {mode}
                   </button>
                 ))}
              </div>
            </div>
            <ToolbarBtn 
              icon={showNumbers ? Eye : EyeOff} 
              label={showNumbers ? "Hide Metrics" : "Show Metrics"} 
              onClick={toggleNumbers} 
              theme={theme}
            />
          </Panel>

          <ShortcutsHelper theme={theme} />
          {menu && <ContextMenu 
            onClick={() => setMenu(null)} 
            {...menu} 
            theme={theme} 
            handleExportSelection={handleExportSelection}
          />}
        </ReactFlow>
      </main>

      {/* Right Sidebar - Editor & Mockup */}
      <aside className={cn(
        "border-l flex flex-col h-full overflow-hidden",
        theme === 'dark' ? "bg-sidebar border-border" : "bg-white border-slate-200 shadow-xl"
      )}>
        <Sidebar />
      </aside>

      {/* Footer */}
      <Footer theme={theme} />
    </div>
  );
}

function ExportOption({ label, onClick, theme }: { label: string; onClick: () => void; theme: 'dark' | 'light' }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
        theme === 'dark' ? "text-text-dim hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}

function ToolkitItem({ icon: Icon, label, color, onClick, hasSubmenu, active, theme }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full h-10 flex items-center gap-3 px-3 rounded-lg border transition-all text-xs font-bold group text-left relative",
        active ? "bg-accent border-accent text-bg" : (
          theme === 'dark' ? "bg-white/[0.03] hover:bg-white/[0.08] border-border text-text-dim" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
        )
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", active ? "bg-bg" : color)} />
      <Icon size={14} className={active ? "text-bg" : (theme === 'dark' ? "group-hover:text-white" : "group-hover:text-slate-900")} />
      <span className={cn("truncate flex-1 font-bold", active ? "text-bg" : (theme === 'dark' ? "group-hover:text-white" : "group-hover:text-slate-900"))}>{label}</span>
      {hasSubmenu && <ChevronRight size={14} className={cn("transition-transform duration-200", active ? "rotate-90 text-bg" : "")} />}
    </button>
  );
}

function SubToolkitItem({ label, onClick, theme }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full pl-8 pr-3 py-1.5 text-[10px] font-bold transition-all text-left tracking-tight",
        theme === 'dark' ? "text-text-dim hover:text-white hover:bg-white/5" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}

function OutdoorSubMenu({ onClick, theme }: any) {
  const categories = [
    { label: 'Billboard', items: ['Standard Billboard'] },
    { 
      label: 'MTR', 
      items: [
        'MTR Digital Panel', 
        'MTR Lightbox Concourse (4-Sheet / 12-Sheet)', 
        'MTR Lightbox Trackside (4-Sheet / 12-Sheet)',
        'MTR Escalator Crown Panels',
        'MTR In-train Display'
      ] 
    },
    { label: 'Tram', items: ['Tram Body', 'Tram Shelter'] },
    { 
      label: 'Bus', 
      items: [
        'Bus Exterior - Whole bus (Signature/Super/Half)',
        'Bus Exterior - Single side (T-Shape/Superside/Hammer)',
        'Bus Interior (Seat Back/Captain/Wheelchair/TV)'
      ] 
    },
    { label: 'Others', items: ['Other Outdoor'] }
  ];

  return (
    <div className="space-y-4 py-2">
       {categories.map(cat => (
         <div key={cat.label}>
           <div className={cn(
             "px-4 text-[9px] font-black mb-1",
             theme === 'dark' ? "text-accent/60" : "text-accent"
           )}>{cat.label}</div>
           {cat.items.map(item => (
             <SubToolkitItem key={item} label={item} onClick={() => onClick(item)} theme={theme} />
           ))}
         </div>
       ))}
    </div>
  );
}

function ToolbarBtn({ icon: Icon, label, onClick, theme }: any) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={cn(
        "p-2 rounded-lg transition-all flex items-center gap-2 group",
        theme === 'dark' ? "bg-white/5 hover:bg-accent hover:text-bg border-border" : "bg-white border-slate-200 hover:bg-accent hover:border-accent hover:text-bg shadow-sm"
      )}
    >
      <Icon size={16} />
      <span className="text-[10px] font-black tracking-widest hidden group-hover:block whitespace-nowrap">{label}</span>
    </button>
  );
}

function ShortcutsHelper({ theme }: { theme: 'dark' | 'light' }) {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    (window as any).toggleShortcuts = () => setIsOpen(prev => !prev);
    return () => delete (window as any).toggleShortcuts;
  }, []);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['V'], label: 'Selection Tool' },
    { keys: ['H'], label: 'Hand Tool' },
    { keys: ['Ctrl', 'C'], label: 'Copy Selection' },
    { keys: ['Ctrl', 'V'], label: 'Paste Selection' },
    { keys: ['Ctrl', 'D'], label: 'Duplicate Selection' },
    { keys: ['Backspace', 'Del'], label: 'Delete Selection' },
    { keys: ['Ctrl', 'Z'], label: 'Undo' },
    { keys: ['Ctrl', 'Y'], label: 'Redo' },
    { keys: ['Ctrl', 'G'], label: 'Group Nodes' },
    { keys: ['Ctrl', 'Shift', 'G'], label: 'Ungroup' },
    { keys: ['Ctrl', 'A'], label: 'Select All' },
    { keys: ['Esc'], label: 'Clear Selection' },
    { keys: ['Space', 'Drag'], label: 'Pan Canvas' },
    { keys: ['Wheel'], label: 'Zoom / Scroll' },
  ];

  return (
    <Panel position="bottom-right" className="m-4 animate-in fade-in slide-in-from-right-4">
      <div className={cn(
        "w-64 rounded-2xl shadow-2xl border flex flex-col overflow-hidden",
        theme === 'dark' ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-accent">Shortcuts & Tips</span>
          <button onClick={() => setIsOpen(false)} className="text-text-dim hover:text-white"><LucideIcons.X size={14} /></button>
        </div>
        <div className="p-2 space-y-1">
          {shortcuts.map(s => (
            <div key={s.label} className="flex items-center justify-between px-2 py-1.5 hover:bg-black/5 rounded-lg transition-colors">
              <span className={cn("text-[10px] font-bold", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>{s.label}</span>
              <div className="flex gap-1">
                {s.keys.map(k => (
                  <kbd key={k} className={cn(
                    "px-1.5 py-0.5 rounded border text-[8px] font-black",
                    theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
                  )}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={cn("p-4 border-t border-border mt-2", theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50/50")}>
           <div className="flex items-center gap-2 mb-2">
              <LucideIcons.CloudUpload size={12} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Auto-save & Sync</span>
           </div>
           <p className="text-[10px] leading-relaxed text-text-dim">
             All changes are <strong>auto-saved</strong> locally every 30s. Creating a <strong>Firebase Account</strong> enables cross-device cloud sync and shared campaign links.
           </p>
        </div>
      </div>
    </Panel>
  );
}

function StatGroup({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={cn(
        "text-[10px] font-black tracking-widest",
        theme === 'dark' ? "text-text-dim" : "text-slate-400"
      )}>{label}:</span>
      <span className="text-sm font-bold text-accent">{value}</span>
    </div>
  );
}

function Footer({ theme }: { theme: 'dark' | 'light' }) {
  const { nodes, showNumbers } = useStore();
  const totalConversions = nodes.reduce((acc, node) => {
    if (node.data?.type === 'physical') {
      const dropoff = 1 - ((node.data?.physicalDropoff || 20) / 100);
      return acc + ((node.data?.volume || 0) * dropoff);
    }
    return acc;
  }, 0);
  const totalBudget = nodes.reduce((acc, node) => acc + ((node.data?.volume || 0) * (node.data?.cpc || 0.5)), 0);

  const footerClass = cn(
    "col-span-full border-t flex items-center px-6 gap-10",
    theme === 'dark' ? "bg-sidebar border-border" : "bg-white border-slate-200"
  );

  if (!showNumbers) {
    return (
      <footer className={footerClass}>
        <span className="text-[10px] font-black tracking-widest text-text-dim opacity-50">Campaign metrics hidden</span>
      </footer>
    );
  }

  return (
    <footer className={footerClass}>
      <StatGroup label="Total Budget" value={`HK$${totalBudget.toLocaleString()}`} theme={theme} />
      <StatGroup label="Est. Physical Leads" value={Math.round(totalConversions).toLocaleString()} theme={theme} />
      <StatGroup label="CPA (Offline)" value={`HK$${(totalBudget / (totalConversions || 1)).toFixed(2)}`} theme={theme} />
      <div className="flex-1" />
      <button 
        onClick={() => (window as any).toggleShortcuts?.()}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none",
          theme === 'dark' ? "text-text-dim hover:bg-white/5 hover:text-white" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <LucideIcons.Keyboard size={14} /> Shortcuts
      </button>
    </footer>
  );
}

function ContextMenu({ 
  id, 
  type, 
  top, 
  left, 
  onClick,
  theme,
  handleExportSelection
}: any) {
  const { 
    nodes,
    copySelection, 
    pasteSelection, 
    duplicateSelection, 
    deleteSelection,
    deleteEdge,
    bringToFront,
    sendToBack,
    createGroup,
    ungroup
  } = useStore();

  const handleAction = (action: () => void) => {
    action();
    onClick();
  };

  const selectedNodes = nodes.filter(n => n.selected);
  const isMultiSelect = selectedNodes.length > 1;
  
  // If we clicked on a node that is part of a selection, or on the pane while multiple nodes are selected
  const activeNodeId = id || (isMultiSelect ? selectedNodes[0].id : null);
  const node = nodes.find(n => n.id === activeNodeId);
  
  // Check if we are right-clicking a node that is within a group
  const parentGroupId = node?.parentId;
  const isInsideGroup = !!parentGroupId;
  
  const isLanding = node?.type === 'landing';
  const isMarketing = node?.type === 'marketing';
  const isGroup = node?.type === 'group';

  const isNode = (type && type !== 'edge' && type !== 'pane') || isMultiSelect;
  const isEdge = type === 'edge';
  const isPane = !type || type === 'pane';

  // State adjustment to keep menu in viewport
  const [position, setPosition] = useState({ top, left });
  const menuRef = useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const padding = 10;
      let newTop = top;
      let newLeft = left;

      if (top + rect.height > window.innerHeight) {
        newTop = window.innerHeight - rect.height - padding;
      }
      if (left + rect.width > window.innerWidth) {
        newLeft = window.innerWidth - rect.width - padding;
      }

      // Ensure it doesn't go off the top/left either
      newTop = Math.max(padding, newTop);
      newLeft = Math.max(padding, newLeft);

      setPosition({ top: newTop, left: newLeft });
    }
  }, [top, left]);

  return (
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
      className={cn(
        "fixed z-[1000] min-w-[180px] rounded-xl shadow-2xl border p-1 animate-in zoom-in-95 duration-100",
        theme === 'dark' ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 shadow-slate-200/50"
      )}
      onMouseLeave={onClick}
    >
      <div className="flex flex-col gap-0.5">
        {isNode && (
          <>
            <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-text-dim opacity-50 flex items-center justify-between">
              <span>{isMultiSelect ? 'Selection' : (node?.data.label || 'Node')} Actions</span>
              <span className="bg-accent/10 text-accent px-1 rounded">{isMultiSelect ? `${selectedNodes.length} Items` : node?.type}</span>
            </div>
            
            {/* Context Specific Smart Actions */}
            {!isMultiSelect && isLanding && (
              <ContextMenuItem 
                icon={LucideIcons.RefreshCcw} 
                label="Reset Content Stack" 
                onClick={() => handleAction(() => {
                  useStore.getState().updateNodeData(id, { mockupModules: [{ id: 'm1', type: 'Hero', content: {} }, { id: 'm2', type: 'CTA', content: {} }] });
                })} 
                theme={theme} 
              />
            )}
            
            {!isMultiSelect && isMarketing && (
              <ContextMenuItem 
                icon={LucideIcons.Settings2} 
                label="Configure Channel" 
                onClick={() => handleAction(() => useStore.getState().setSelectedNode(id))} 
                theme={theme} 
              />
            )}

            <div className="h-[1px] bg-border my-1 mx-1 opacity-20" />

            <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-text-dim opacity-50">Selection Export</div>
            <ContextMenuItem icon={LucideIcons.ImageDown} label="Download Selection as PNG" onClick={() => handleAction(() => handleExportSelection('download'))} theme={theme} />
            <ContextMenuItem icon={LucideIcons.ClipboardCopy} label="Copy Selection as PNG" onClick={() => handleAction(() => handleExportSelection('clipboard'))} theme={theme} />
            
            <div className="h-[1px] bg-border my-1 mx-1 opacity-20" />
            
            <ContextMenuItem icon={LucideIcons.Copy} label="Copy Selection" onClick={() => handleAction(copySelection)} theme={theme} />
            <ContextMenuItem icon={LucideIcons.Files} label="Duplicate" onClick={() => handleAction(duplicateSelection)} theme={theme} />
            <ContextMenuItem icon={LucideIcons.Trash2} label="Delete Selection" onClick={() => handleAction(deleteSelection)} theme={theme} danger />
            
            <div className="h-[1px] bg-border my-1 mx-1 opacity-20" />
            
            <ContextMenuItem icon={LucideIcons.ArrowUpToLine} label="Bring to Top" onClick={() => handleAction(() => {
              if (isMultiSelect) selectedNodes.forEach(n => bringToFront(n.id));
              else bringToFront(id);
            })} theme={theme} />
            <ContextMenuItem icon={LucideIcons.ArrowDownToLine} label="Send to Back" onClick={() => handleAction(() => {
              if (isMultiSelect) selectedNodes.forEach(n => sendToBack(n.id));
              else sendToBack(id);
            })} theme={theme} />
            
            {isGroup || isInsideGroup ? (
              <ContextMenuItem icon={LucideIcons.Unlink} label="Ungroup" onClick={() => handleAction(() => ungroup(isGroup ? id : parentGroupId!))} theme={theme} />
            ) : (
              <ContextMenuItem icon={LucideIcons.Layers} label="Group" onClick={() => handleAction(() => {
                const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
                if (selectedIds.length > 1) createGroup(selectedIds);
                else if (id) createGroup([id]);
              })} theme={theme} />
            )}
          </>
        )}

        {isEdge && !isMultiSelect && (
          <>
             <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-text-dim opacity-50">Edge Actions</div>
             <ContextMenuItem icon={LucideIcons.Trash2} label="Remove Connection" onClick={() => handleAction(() => deleteEdge(id))} theme={theme} danger />
          </>
        )}

        {(isPane || (isMultiSelect && !id)) && (
          <>
             <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-text-dim opacity-50">Canvas Actions</div>
             <ContextMenuItem icon={LucideIcons.Clipboard} label="Paste" onClick={() => handleAction(pasteSelection)} theme={theme} />
             <ContextMenuItem icon={LucideIcons.LayoutGrid} label="Auto-Arrange (Grid)" onClick={() => handleAction(() => useStore.getState().arrangeGrid('grid'))} theme={theme} />
             <ContextMenuItem icon={LucideIcons.Maximize} label="Fit View" onClick={() => handleAction(() => {})} theme={theme} />
          </>
        )}
      </div>
    </div>
  );
}

function ContextMenuItem({ icon: Icon, label, onClick, theme, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all text-left",
        theme === 'dark' 
          ? (danger ? "text-red-400 hover:bg-red-500/10" : "text-text-dim hover:text-white hover:bg-white/5")
          : (danger ? "text-red-500 hover:bg-red-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")
      )}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}
