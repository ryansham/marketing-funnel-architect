/* Copyright@ryansham.martechtalks_ryansham.com */
// ─── i18n ─────────────────────────────────────────────────────────────────────
const langDict = {
  en: {
    appName: 'Marketing Funnel Architect',
    discoveryChannels: 'Discovery Channels', landingPage: 'Landing Page',
    toolsVisuals: 'Tools & Visuals', marketingPresets: 'Marketing Presets',
    history: 'History', savePreset: '+ Save current as preset',
    socialFlow: 'Social Flow', autoArrange: 'Auto Arrange',
    fitView: 'Fit View', importJSON: 'Import JSON', exportLabel: 'Export',
    confirmReplace: 'This will replace your current canvas. Continue?',
    searchPlaceholder: 'Search nodes... (Esc to close)',
    benchmarkLabel: 'Industry Benchmark',
  },
  'zh-hk': {
    appName: 'Marketing Funnel Architect',
    discoveryChannels: '探索頻道', landingPage: '著陸頁',
    toolsVisuals: '工具與視覺', marketingPresets: '行銷模板',
    history: '歷史記錄', savePreset: '+ 儲存為模板',
    socialFlow: '社交流程', autoArrange: '自動排列',
    fitView: '全圖顯示', importJSON: '匯入 JSON', exportLabel: '匯出',
    confirmReplace: '此操作將取代目前畫布，確定繼續？',
    searchPlaceholder: '搜尋節點… (Esc 關閉)',
    benchmarkLabel: '業界基準',
  },
  'zh-cn': {
    appName: 'Marketing Funnel Architect',
    discoveryChannels: '探索渠道', landingPage: '落地页',
    toolsVisuals: '工具与视觉', marketingPresets: '营销模板',
    history: '历史记录', savePreset: '+ 保存为模板',
    socialFlow: '社交流程', autoArrange: '自动排列',
    fitView: '全图显示', importJSON: '导入 JSON', exportLabel: '导出',
    confirmReplace: '此操作将替换当前画布，确定继续？',
    searchPlaceholder: '搜索节点… (Esc 关闭)',
    benchmarkLabel: '行业基准',
  },
} as const;


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
  const [showMiniMap, setShowMiniMap] = React.useState(false);
  const [lang, setLang] = React.useState<'en'|'zh-hk'|'zh-cn'>(() => (localStorage.getItem('fa_lang') as any) || 'en');
  const t = React.useMemo(() => langDict[lang], [lang]);
  const setLanguage = (l: 'en'|'zh-hk'|'zh-cn') => { setLang(l); localStorage.setItem('fa_lang', l); };
  const [leftCollapsed, setLeftCollapsed] = React.useState<Record<string,boolean>>({});
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showTour, setShowTour] = React.useState(() => !localStorage.getItem('fa_tour_done'));
  const [tourStep, setTourStep] = React.useState(0);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState<Record<string,boolean>>({});

  // Set document title
  React.useEffect(() => { document.title = 'Marketing Funnel Architect'; }, []);
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
    // First time: show template chooser instead of auto-creating default
    const isFirstTime = !localStorage.getItem('fa_tour_done');
    if (isFirstTime) {
      setShowTemplates(true);
    } else {
      createDefaultSequence();
    }
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(v => !v);
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

    // Expand selection to include directly connected nodes
    const selectedIds = new Set(selectedNodes.map(n => n.id));
    const connectedIds = new Set<string>();
    edges.forEach(e => {
      if (selectedIds.has(e.source)) connectedIds.add(e.target);
      if (selectedIds.has(e.target)) connectedIds.add(e.source);
    });
    const exportNodes = nodes.filter(n => selectedIds.has(n.id) || connectedIds.has(n.id));

    try {
      container.classList.add('is-exporting');
      const { toPng, toBlob } = await import('html-to-image');
      
      const padding = 60;
      const minX = Math.min(...exportNodes.map(n => n.position.x));
      const minY = Math.min(...exportNodes.map(n => n.position.y));
      const maxX = Math.max(...exportNodes.map(n => n.position.x + (n.width ?? 220)));
      const maxY = Math.max(...exportNodes.map(n => n.position.y + (n.height ?? 100)));
      
      const width  = (maxX - minX) + padding * 2;
      const height = (maxY - minY) + padding * 2;

      const bgColor = theme === 'dark' ? '#020617' : '#ffffff';

      const options = {
        width,
        height,
        backgroundColor: bgColor,
        pixelRatio: 2,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
        },
        filter: (node: HTMLElement) => {
          // Strip UI-only elements from the export
          const cls = node.className || '';
          if (typeof cls !== 'string') return true;
          if (cls.includes('react-flow__handle')) return false;
          if (cls.includes('react-flow__node-resizer')) return false;
          if (cls.includes('react-flow__edge-label')) return false;
          if (cls.includes('nodrag') && cls.includes('nopan')) return false; // edge action buttons
          // Hide the floating layer-control toolbar on nodes
          if (node.getAttribute && node.getAttribute('title') === 'Bring to Front') return false;
          if (node.getAttribute && node.getAttribute('title') === 'Send to Back') return false;
          return true;
        },
      };

      if (mode === 'clipboard') {
        const blob = await toBlob(renderer, options);
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      } else {
        const dataUrl = await toPng(renderer, options);
        const link = document.createElement('a');
        link.download = `funnel-export-${Date.now()}.png`;
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
    // Don't select group nodes directly — let clicks pass through to children
    if (node.type === 'group') return;
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setMenu(null);  // always close context menu when clicking canvas
  }, [setSelectedNode, setMenu]);

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
        // Ads channels get their brand fill color
        ...(extraData.primaryChannel === 'google-ads' ? { fillColor: 'rgba(66,133,244,0.08)', strokeColor: '#4285F4' } : {}),
        ...(extraData.primaryChannel === 'facebook' ? { fillColor: 'rgba(24,119,242,0.08)', strokeColor: '#1877F2' } : {}),
        ...(extraData.primaryChannel === 'instagram' ? { fillColor: 'rgba(228,64,95,0.08)', strokeColor: '#E4405F' } : {}),
        ...(extraData.primaryChannel === 'youtube' ? { fillColor: 'rgba(255,0,0,0.08)', strokeColor: '#FF0000' } : {}),
        ...(extraData.primaryChannel === 'whatsapp' ? { fillColor: 'rgba(37,211,102,0.08)', strokeColor: '#25D366' } : {}),
        ...(extraData.primaryChannel === 'tiktok' ? { fillColor: 'rgba(1,1,1,0.06)', strokeColor: '#010101' } : {}),
        ...(extraData.primaryChannel === 'wechat' ? { fillColor: 'rgba(7,193,96,0.08)', strokeColor: '#07C160' } : {}),
        ...extraData
      },
    };
    setNodes([...nodes, newNode]);
    setSpawnOffset((spawnOffset + 1) % 10);
  };

  const createDefaultSequence = () => {
    const t = Date.now();
    const metaId   = 'n-meta-'   + t;
    const googleId = 'n-google-' + t;
    const landingId= 'n-lp-'     + t;
    const formId   = 'n-form-'   + t;
    const emailId  = 'n-email-'  + t;
    const waId     = 'n-wa-'     + t;
    const titleId  = 'n-title-'  + t;

    // Positions: left→right, vertically centered
    // Meta Ads & Google Ads stacked at col 0, Landing at col 1 (center), Form at col 2, Email+WA at col 3 stacked
    const X0 = 80, X1 = 440, X2 = 780, X3 = 1120;
    const CY = 320; // vertical center

    const newNodes: any[] = [
      // ── Title card (top-left, left-aligned) ──────────────────────────────────
      { id: titleId, type: 'title', position: { x: X0, y: 40 },
        data: { label: 'Marketing Funnel', label2: 'Objective: Drive O2O conversions by attracting online audiences and guiding them to complete an offline action — from digital touchpoints to real-world engagement.',
          type: 'title', fontFamily: 'Montserrat', textAlign: 'left', volume: 0, ctr: 0, cpc: 0 } },

      // ── Ads layer (col 0) ─────────────────────────────────────────────────────
      { id: metaId, type: 'marketing', position: { x: X0, y: CY - 80 },
        data: { label: 'Meta Ads', type: 'discovery', primaryChannel: 'facebook',
          volume: 15000, ctr: 3.2, cpc: 0.45,
          note: 'Target interest-based audiences on Facebook & Instagram. Use carousel ads showcasing the campaign offer to drive awareness and clicks to the landing page.' } },
      { id: googleId, type: 'marketing', position: { x: X0, y: CY + 120 },
        data: { label: 'Google Ads', type: 'discovery', primaryChannel: 'google-ads',
          volume: 12000, ctr: 4.1, cpc: 0.62,
          note: 'Capture high-intent users via Search & Display. Bid on branded and category keywords to intercept users actively searching for relevant offers.' } },

      // ── Landing Page (col 1, center) ──────────────────────────────────────────
      { id: landingId, type: 'landing', position: { x: X1, y: CY - 150 },
        data: { label: 'Campaign Page', type: 'owned', pageType: 'Static Page',
          mockupModules: [
            { id: 'm1', type: 'Hero', label: 'Hero Banner' },
            { id: 'm2', type: 'CTA',  label: 'CTA Button' },
            { id: 'm3', type: 'Subscription', label: 'Lead Capture' },
          ] } },

      // ── Registration Form (col 2) ─────────────────────────────────────────────
      { id: formId, type: 'marketing', position: { x: X2, y: CY - 20 },
        data: { label: 'Registration Form', type: 'discovery', primaryChannel: 'form',
          volume: 0, ctr: 0, cpc: 0,
          note: 'Collect essential lead data: name, phone, email. Keep form fields minimal (3–5 fields) to maximise completion rate. Add a compelling incentive (e.g. exclusive gift) above the form.' } },

      // ── Confirmations (col 3, stacked) ────────────────────────────────────────
      { id: emailId, type: 'marketing', position: { x: X3, y: CY - 120 },
        data: { label: 'Email Confirmation', type: 'discovery', primaryChannel: 'email',
          volume: 0, ctr: 0, cpc: 0,
          note: 'Send an automated confirmation email immediately after registration. Include: campaign details, redemption instructions, event date/location, and a QR code for offline check-in.' } },
      { id: waId, type: 'marketing', position: { x: X3, y: CY + 80 },
        data: { label: 'WhatsApp Confirmation', type: 'discovery', primaryChannel: 'whatsapp',
          volume: 0, ctr: 0, cpc: 0,
          note: 'Follow up via WhatsApp for higher open rates (>90%). Send a reminder 24h before the event with the redemption QR code. Consider a chatbot flow for FAQs and upsell.' } },
    ];

    const newEdges: any[] = [
      // Both ads → landing
      { id: `e-meta-lp`,   source: metaId,   target: landingId, sourceHandle: 'right', targetHandle: 'left', type: 'custom' },
      { id: `e-google-lp`, source: googleId,  target: landingId, sourceHandle: 'right', targetHandle: 'left', type: 'custom' },
      // Landing → Form
      { id: `e-lp-form`,   source: landingId, target: formId,    sourceHandle: 'right', targetHandle: 'left', type: 'custom' },
      // Form → both confirmations
      { id: `e-form-email`,source: formId,    target: emailId,   sourceHandle: 'right', targetHandle: 'left', type: 'custom' },
      { id: `e-form-wa`,   source: formId,    target: waId,      sourceHandle: 'right', targetHandle: 'left', type: 'custom' },
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

  // Confirm before replacing canvas
  const confirmReplace = (action: () => void) => {
    const { nodes } = useStore.getState();
    if (nodes.length > 0 && !window.confirm(t.confirmReplace)) return;
    action();
  };

  // Collapsible section toggle helper
  const toggleSection = (side: 'left' | 'right', key: string) => {
    if (side === 'left') setLeftCollapsed(p => ({ ...p, [key]: !p[key] }));
    else setRightCollapsed(p => ({ ...p, [key]: !p[key] }));
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
          {/* Language Switcher */}
          <div className={cn("flex rounded-lg border overflow-hidden text-[9px] font-black", theme === 'dark' ? "bg-white/5 border-border" : "bg-white border-slate-200 shadow-sm")}>
            {(['en','zh-hk','zh-cn'] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)} className={cn("px-2 py-1.5 transition-all uppercase tracking-wider", lang === l ? "bg-accent text-bg" : theme === 'dark' ? "text-white/50 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50")}>
                {l === 'en' ? 'EN' : l === 'zh-hk' ? '繁' : '简'}
              </button>
            ))}
          </div>
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
          <button onClick={() => toggleSection('left','discovery')} className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 opacity-50 hover:opacity-100 transition-opacity">
            <span>{t.discoveryChannels}</span>
            <LucideIcons.ChevronDown size={12} className={cn("transition-transform", leftCollapsed['discovery'] && "rotate-180")} />
          </button>
          {!leftCollapsed['discovery'] && <>
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
          </>}
        </section>

        <section>
          <button onClick={() => toggleSection('left','landing')} className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 opacity-50 hover:opacity-100 transition-opacity">
            <span>Landing Page</span>
            <LucideIcons.ChevronDown size={12} className={cn("transition-transform", leftCollapsed['landing'] && "rotate-180")} />
          </button>
          {!leftCollapsed['landing'] && <>
          <div className="space-y-2">
            <ToolkitItem icon={Globe} label="Landing Page" color="bg-owned" onClick={() => addNode('owned', 'Campaign Page', 'landing', { pageType: 'Static Page', mockupModules: [{ id: 'm1', type: 'Hero' }, { id: 'm2', type: 'CTA' }, { id: 'm3', type: 'Subscription' }] })} theme={theme} />
          </div>
          </>}
        </section>

        <section>
          <button onClick={() => toggleSection('left','tools')} className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 opacity-50 hover:opacity-100 transition-opacity">
            <span>Tools &amp; Visuals</span>
            <LucideIcons.ChevronDown size={12} className={cn("transition-transform", leftCollapsed['tools'] && "rotate-180")} />
          </button>
          {!leftCollapsed['tools'] && <>
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
          </>}
        </section>

        <section className="mt-auto pt-6 border-t border-border/10">
          <button onClick={() => toggleSection('left','presets')} className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 opacity-50 hover:opacity-100 transition-opacity">
            <span>Marketing Presets</span>
            <LucideIcons.ChevronDown size={12} className={cn("transition-transform", leftCollapsed['presets'] && "rotate-180")} />
          </button>
          {!leftCollapsed['presets'] && <>
          <div className="space-y-2">
            {presets.map(p => (
              <ToolkitItem 
                key={p.id} 
                icon={Database} 
                label={p.name} 
                color="bg-slate-500" 
                onClick={() => confirmReplace(() => loadPreset(p.id))} 
                theme={theme} 
              />
            ))}
            <button
              onClick={() => setShowTemplates(true)}
              className={cn("w-full h-10 flex items-center gap-3 px-3 rounded-lg border transition-all text-xs font-bold text-left", theme === 'dark' ? "bg-white/[0.03] hover:bg-white/[0.08] border-border text-text-dim" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}
            >
              <LucideIcons.LayoutTemplate size={14} />
              Browse Templates
            </button>
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
          </>}
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
          defaultEdgeOptions={{
            type: 'custom',
            style: { strokeWidth: 1.5 },
          }}
          connectionLineStyle={{ stroke: '#38bdf8', strokeWidth: 2 }}
        >
          <Background 
            color={theme === 'dark' ? "#1e293b" : "#e2e8f0"} 
            variant={BackgroundVariant.Lines}
            gap={24}
            lineWidth={0.5}
          />

          {showMiniMap && <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            nodeColor={(n) => {
              if (n.type === 'marketing') {
                const ch = n.data?.primaryChannel;
                if (ch === 'facebook') return '#1877F2';
                if (ch === 'instagram') return '#E4405F';
                if (ch === 'whatsapp') return '#25D366';
                if (ch === 'youtube') return '#FF0000';
                if (ch === 'email') return '#6366f1';
                return '#3b82f6';
              }
              if (n.type === 'landing') return '#a855f7';
              if (n.type === 'title') return '#64748b';
              if (n.type === 'text') return '#94a3b8';
              if (n.type === 'shape') return '#38bdf8';
              return '#cbd5e1';
            }}
            maskColor={theme === 'dark' ? 'rgba(2,6,23,0.7)' : 'rgba(248,250,252,0.7)'}
            className={cn(
              "!rounded-xl !border !shadow-2xl",
              theme === 'dark' ? "!bg-slate-900 !border-white/10" : "!bg-white !border-slate-200"
            )}
          />}

          <Panel position="bottom-left" className="flex items-end mb-2 ml-2">
             <div className={cn(
               "flex flex-row items-center rounded-xl border p-1 gap-0.5 border-border shadow-2xl",
               theme === 'dark' ? "bg-slate-900" : "bg-white"
             )}>
                {/* Tool mode */}
                <button onClick={() => setInteractionMode('select')} className={cn("p-2 rounded-lg transition-all", interactionMode === 'select' ? "bg-accent text-bg shadow-lg" : "text-text-dim hover:bg-black/5")} title="Selection Tool (V)"><LucideIcons.MousePointer2 size={16} /></button>
                <button onClick={() => setInteractionMode('pan')} className={cn("p-2 rounded-lg transition-all", interactionMode === 'pan' ? "bg-accent text-bg shadow-lg" : "text-text-dim hover:bg-black/5")} title="Hand Tool (H / Space)"><LucideIcons.Hand size={16} /></button>
                <div className="w-[1px] h-5 bg-border mx-1 opacity-30" />
                {/* Zoom controls */}
                <Controls className={cn("!static !m-0 !border-none !shadow-none !bg-transparent !overflow-visible !flex !flex-row !gap-0.5", theme === 'dark' ? "!fill-white" : "!fill-slate-600")} showInteractive={false} />
                <div className="w-[1px] h-5 bg-border mx-1 opacity-30" />
                {/* Auto Arrange */}
                <button onClick={() => arrangeGrid('grid')} className="p-2 rounded-lg transition-all text-text-dim hover:bg-black/5" title="Auto Arrange"><LucideIcons.LayoutGrid size={16} /></button>
                {/* Cmd+K Search */}
                <button onClick={() => setShowSearch(v => !v)} className={cn("p-2 rounded-lg transition-all", showSearch ? "bg-accent text-bg shadow-lg" : "text-text-dim hover:bg-black/5")} title="Search nodes (⌘K)"><LucideIcons.Search size={16} /></button>
                {/* MiniMap toggle */}
                <button onClick={() => setShowMiniMap(v => !v)} className={cn("p-2 rounded-lg transition-all", showMiniMap ? "bg-accent text-bg shadow-lg" : "text-text-dim hover:bg-black/5")} title="Toggle MiniMap"><LucideIcons.Map size={16} /></button>
             </div>
          </Panel>


          


          {/* Cmd+K Search Overlay */}
          {showSearch && (
            <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[20vh]" onClick={() => setShowSearch(false)}>
              <div className={cn("w-[480px] rounded-2xl shadow-2xl border overflow-hidden", theme === 'dark' ? "bg-slate-900 border-white/10" : "bg-white border-slate-200")} onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <LucideIcons.Search size={16} className="text-text-dim" />
                  <input
                    autoFocus
                    className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-text-dim"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }}
                  />
                  <kbd className={cn("text-[9px] px-1.5 py-0.5 rounded font-mono", theme === 'dark' ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-400")}>ESC</kbd>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {nodes
                    .filter(n => n.data?.label?.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0)
                    .slice(0, 8)
                    .map(n => (
                      <button key={n.id} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-all", theme === 'dark' ? "hover:bg-white/10 text-white" : "hover:bg-slate-50 text-slate-800")}
                        onClick={() => {
                          useStore.getState().setSelectedNode(n.id);
                          setShowSearch(false); setSearchQuery('');
                          // fly to node
                          setTimeout(() => document.querySelector('.react-flow__controls-fitview')?.dispatchEvent(new MouseEvent('click',{bubbles:true})), 50);
                        }}
                      >
                        <LucideIcons.Layers size={14} className="text-accent shrink-0" />
                        <div>
                          <div className="font-bold text-xs">{n.data?.label}</div>
                          <div className="text-[10px] opacity-50 capitalize">{n.type}</div>
                        </div>
                      </button>
                    ))
                  }
                  {searchQuery.length === 0 && (
                    <div className="px-3 py-4 text-center text-[11px] text-text-dim opacity-50">
                      Start typing to find a node on the canvas
                    </div>
                  )}
                  {searchQuery.length > 0 && nodes.filter(n => n.data?.label?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="px-3 py-4 text-center text-[11px] text-text-dim opacity-50">No nodes found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Guided Tour ─────────────────────────────────────────────── */}
          {showTour && (() => {
            const STEPS = [
              { icon: '🃏', title: 'Drag cards onto the canvas', body: 'Pick any channel from the left panel (Ads, Email, Social…) and drag it onto the canvas.' },
              { icon: '🔗', title: 'Connect cards', body: 'Hover a card to reveal its blue handles, then drag from a handle to another card to create a connection.' },
              { icon: '⚙️', title: 'Configure each step', body: 'Click any card to open its settings on the right — add notes, change channel, and style your funnel.' },
              { icon: '📤', title: 'Export your funnel', body: 'Use the Export button (top-right) to download as PNG, PDF or share as JSON.' },
            ];
            const step = STEPS[tourStep];
            return (
              <div className="fixed inset-0 z-[3000] flex items-end justify-center pb-10 pointer-events-none">
                <div className={cn("pointer-events-auto w-[380px] rounded-2xl shadow-2xl border p-5 animate-in slide-in-from-bottom-4", theme === 'dark' ? "bg-slate-900 border-white/10" : "bg-white border-slate-200")}>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{step.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-dim opacity-50">{tourStep+1} / {STEPS.length}</span>
                        <button onClick={() => { setShowTour(false); localStorage.setItem('fa_tour_done','1'); }} className="text-[9px] text-text-dim hover:text-accent transition-colors">Skip tour</button>
                      </div>
                      <div className="font-black text-sm mb-1">{step.title}</div>
                      <div className="text-[11px] text-text-dim leading-relaxed">{step.body}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex gap-1 flex-1">
                      {STEPS.map((_, i) => <div key={i} className={cn("h-1 rounded-full flex-1 transition-all", i === tourStep ? "bg-accent" : "bg-border")} />)}
                    </div>
                    {tourStep < STEPS.length - 1
                      ? <button onClick={() => setTourStep(s => s+1)} className="px-4 py-1.5 bg-accent text-bg rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-transform">Next</button>
                      : <button onClick={() => { setShowTour(false); localStorage.setItem('fa_tour_done','1'); }} className="px-4 py-1.5 bg-accent text-bg rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-transform">Done!</button>
                    }
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Template chooser ─────────────────────────────────────────────── */}
          {showTemplates && (
            <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowTemplates(false)}>
              <div className={cn("w-[720px] max-h-[85vh] rounded-2xl shadow-2xl border flex flex-col animate-in zoom-in-95", theme === 'dark' ? "bg-slate-900 border-white/10" : "bg-white border-slate-200")} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-border shrink-0">
                  <div>
                    <div className="font-black text-base">Choose a Campaign Template</div>
                    <div className="text-[11px] text-text-dim mt-0.5">Each template comes with a full funnel flow, descriptions and strategic notes on every card</div>
                  </div>
                  <button onClick={() => setShowTemplates(false)} className="p-2 rounded-lg hover:bg-black/5 text-text-dim"><LucideIcons.X size={16} /></button>
                </div>
                {/* Templates grid */}
                <div className="overflow-y-auto p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key:'o2o',      emoji:'🏪', title:'O2O Event Campaign',       desc:'Convert online audiences into offline event attendees. Combines paid ads, landing page registration and multi-channel confirmations.',             color:'border-blue-200 bg-blue-50/60' },
                      { key:'leadgen',  emoji:'🎯', title:'Lead Generation Funnel',   desc:'Capture and nurture leads from Search & Social ads through a dedicated landing page into a CRM email sequence.',                                  color:'border-violet-200 bg-violet-50/60' },
                      { key:'loyalty',  emoji:'⭐', title:'Loyalty Re-engagement',    desc:'Win back lapsed customers using WhatsApp and email blasts, directing them to a rewards page for offline redemption.',                              color:'border-amber-200 bg-amber-50/60' },
                      { key:'product',  emoji:'🛍️', title:'New Product Launch',       desc:'Build hype and drive trial for a new product. Multi-channel awareness → landing page → purchase confirmation → post-sale follow-up.',            color:'border-rose-200 bg-rose-50/60' },
                      { key:'webinar',  emoji:'🎓', title:'Webinar & Education',      desc:'Promote an online workshop or masterclass. Social + email ads drive registrations, automated reminders reduce no-shows.',                         color:'border-teal-200 bg-teal-50/60' },
                      { key:'referral', emoji:'🤝', title:'Referral Programme',       desc:'Turn existing customers into brand advocates. Incentivise sharing via WhatsApp, track referral codes and reward both parties.',                    color:'border-green-200 bg-green-50/60' },
                    ].map(tpl => (
                      <button key={tpl.key} onClick={() => {
                        setShowTemplates(false);
                        const z = Date.now();
                        const E = (src: string, tgt: string, eid: string) => ({id:eid,source:src,target:tgt,sourceHandle:'right',targetHandle:'left',type:'custom'});
                        const TN = (id: string, pos: any, label: string, obj: string) => ({id,type:'title',position:pos,data:{label,label2:'Objective: '+obj,type:'title',fontFamily:'Montserrat',textAlign:'left'}});
                        const MN = (id: string, pos: any, label: string, ch: string, note: string) => ({id,type:'marketing',position:pos,data:{label,type:'discovery',primaryChannel:ch,note}});
                        const LN = (id: string, pos: any, label: string, mods: any[]) => ({id,type:'landing',position:pos,data:{label,type:'owned',pageType:'Static Page',mockupModules:mods}});
                        const TX = (id: string, pos: any, note: string) => ({id,type:'text',position:pos,data:{label:'Note',note,type:'text',fontFamily:'Roboto',fontSize:13,width:240,height:90}});

                        if (tpl.key === 'o2o') {
                          createDefaultSequence();
                        } else if (tpl.key === 'leadgen') {
                          const [ga,me,lp,fr,em,ti] = ['lg-ga','lg-me','lg-lp','lg-fr','lg-em','lg-ti'].map(x=>x+z);
                          setNodes([
                            TN(ti,{x:80,y:20},'Lead Generation Funnel','Capture high-intent leads from paid search and social, convert them on a dedicated landing page, and nurture with automated email sequences.'),
                            MN(ga,{x:80,y:280},'Google Search Ads','google-ads','Target users actively searching for your solution. Use SKAG (single keyword ad groups) for precise match and quality score optimisation. Bid on competitor names for steal opportunities.'),
                            MN(me,{x:80,y:480},'Meta Lead Ads','facebook','Run native lead-gen forms on Facebook & Instagram to reduce friction. Audience: custom lookalikes from existing customer list + interest-based cold audiences.'),
                            LN(lp,{x:420,y:180},'Lead Capture Page',[{id:'m1',type:'Hero',label:'Value Proposition'},{id:'m2',type:'Features',label:'Key Benefits'},{id:'m3',type:'Form',label:'Lead Form'},{id:'m4',type:'CTA',label:'Submit CTA'}]),
                            MN(fr,{x:760,y:280},'CRM Entry & Tagging','form','On form submit: tag lead source, score lead (hot/warm/cold), trigger 7-day drip sequence. Integrate with HubSpot or Salesforce via webhook.'),
                            MN(em,{x:1080,y:280},'Email Nurture Sequence','email','Day 1: Welcome + free resource. Day 3: Case study. Day 5: Objection handling FAQ. Day 7: Limited-time offer with urgency CTA.'),
                          ]);
                          setEdges([E(ga,lp,'e1'),E(me,lp,'e2'),E(lp,fr,'e3'),E(fr,em,'e4')]);
                        } else if (tpl.key === 'loyalty') {
                          const [wa,em,lp,qr,ti] = ['ly-wa','ly-em','ly-lp','ly-qr','ly-ti'].map(x=>x+z);
                          setNodes([
                            TN(ti,{x:80,y:20},'Loyalty Re-engagement Campaign','Reactivate lapsed members using personalised WhatsApp and email outreach, directing them to a rewards page for exclusive offline redemption.'),
                            MN(wa,{x:80,y:280},'WhatsApp Re-engagement','whatsapp','Send personalised "We miss you" message with first-name merge tag. Include exclusive returning-member offer (e.g. double points this weekend). Send Friday 6pm for weekend redemption uplift.'),
                            MN(em,{x:80,y:480},'Re-engagement Email','email','Subject: "[Name], your reward expires soon 🎁". Segment by: last purchase > 90 days. A/B test: discount vs. experience-based reward offer.'),
                            LN(lp,{x:420,y:280},'Member Rewards Page',[{id:'m1',type:'Hero',label:'Exclusive Offer Banner'},{id:'m2',type:'Subscription',label:'Member Club'},{id:'m3',type:'Redemption',label:'Reward Offer'},{id:'m4',type:'QR',label:'Redemption QR'}]),
                            MN(qr,{x:760,y:280},'Offline Redemption','outdoor','Staff scans QR at POS terminal. System auto-validates and credits reward. Track redemption rate per channel. Target: >25% redemption rate.'),
                          ]);
                          setEdges([E(wa,lp,'e1'),E(em,lp,'e2'),E(lp,qr,'e3')]);
                        } else if (tpl.key === 'product') {
                          const [ig,tt,lp,wa,em,ti] = ['pl-ig','pl-tt','pl-lp','pl-wa','pl-em','pl-ti'].map(x=>x+z);
                          setNodes([
                            TN(ti,{x:80,y:20},'New Product Launch Funnel','Build pre-launch hype on social, convert interest on a product landing page, then activate purchasers via WhatsApp for advocacy and repeat purchase.'),
                            MN(ig,{x:80,y:280},'Instagram Awareness','instagram','Teaser content: "Something big is coming". Use countdown stickers in Stories. Collaborate with 3–5 micro-influencers (10k–100k) for authentic reach. Swipe-up link to waitlist page.'),
                            MN(tt,{x:80,y:480},'TikTok Launch Video','tiktok','Product demo / unboxing video. Hook in first 2 seconds. Challenge hashtag for UGC. Paid boost on top-performing organic content (whitelist creator account for ads).'),
                            LN(lp,{x:420,y:280},'Product Launch Page',[{id:'m1',type:'Hero',label:'Hero Banner'},{id:'m2',type:'Features',label:'Product Benefits'},{id:'m3',type:'CTA',label:'Buy Now / Pre-order'},{id:'m4',type:'Subscription',label:'Notify Me'}]),
                            MN(wa,{x:760,y:280},'WhatsApp Order Confirmation','whatsapp','Immediate purchase confirmation with order summary. Share link to unboxing guide / setup tutorial. Prompt for first review with incentive (loyalty points).'),
                            MN(em,{x:760,y:480},'Post-purchase Email','email','Day 0: Order confirmation + tracking. Day 3: Onboarding tips. Day 14: "How are you enjoying it?" + review request. Day 30: Cross-sell accessory.'),
                          ]);
                          setEdges([E(ig,lp,'e1'),E(tt,lp,'e2'),E(lp,wa,'e3'),E(lp,em,'e4')]);
                        } else if (tpl.key === 'webinar') {
                          const [ga,em,lp,wa,ev,ti] = ['wb-ga','wb-em','wb-lp','wb-wa','wb-ev','wb-ti'].map(x=>x+z);
                          setNodes([
                            TN(ti,{x:80,y:20},'Webinar & Education Funnel','Drive registrations for an online masterclass using paid search and email, reduce no-shows with WhatsApp reminders, and convert attendees post-event.'),
                            MN(ga,{x:80,y:280},'Google Search Ads','google-ads','Target: "[Topic] training", "[Topic] course", "how to [outcome]". Landing page = registration. Remarketing list for past site visitors. Set max CPA target bid.'),
                            MN(em,{x:80,y:480},'Email Invitation','email','Send to existing list segments. Subject: "Free Masterclass: [Outcome in 60 mins]". Personalise by industry. 3-touch sequence: invite → reminder → last-chance.'),
                            LN(lp,{x:420,y:280},'Webinar Registration Page',[{id:'m1',type:'Hero',label:'Event Details'},{id:'m2',type:'Features',label:'What You'll Learn'},{id:'m3',type:'Form',label:'Register Now'},{id:'m4',type:'CTA',label:'Add to Calendar'}]),
                            MN(wa,{x:760,y:180},'WhatsApp Reminders','whatsapp','T-24h: "See you tomorrow! Here's your join link 👇". T-1h: "Starting soon — click to join". T+0: Live link drop. T+24h: Recording link + next steps.'),
                            MN(ev,{x:760,y:380},'Post-Webinar Follow-up','email','Within 1h: Recording + slides link. Day 2: Key takeaways summary. Day 4: Related resource / offer. Day 7: 1:1 consultation CTA for hot leads.'),
                          ]);
                          setEdges([E(ga,lp,'e1'),E(em,lp,'e2'),E(lp,wa,'e3'),E(lp,ev,'e4')]);
                        } else if (tpl.key === 'referral') {
                          const [wa,em,lp,fr,rw,ti] = ['rf-wa','rf-em','rf-lp','rf-fr','rf-rw','rf-ti'].map(x=>x+z);
                          setNodes([
                            TN(ti,{x:80,y:20},'Referral Programme Funnel','Activate existing customers as brand advocates through a structured referral programme, rewarding both referrer and new customer at conversion.'),
                            MN(wa,{x:80,y:280},'WhatsApp Referral Invite','whatsapp','Send to top 20% of customers by purchase frequency. Message: "You're one of our best customers — share your link and earn [reward] for every friend who buys." Include unique referral code.'),
                            MN(em,{x:80,y:480},'Email Referral Invite','email','Segment: customers with 2+ purchases in last 6 months. Subject: "Earn $[X] for every friend you refer 🎁". Include referral link + social sharing buttons.'),
                            LN(lp,{x:420,y:280},'Referral Landing Page',[{id:'m1',type:'Hero',label:'Referral Offer'},{id:'m2',type:'Features',label:'How It Works'},{id:'m3',type:'Form',label:'Sign Up Form'},{id:'m4',type:'CTA',label:'Share My Link'}]),
                            MN(fr,{x:760,y:280},'New Customer Registration','form','Capture referee details. Auto-apply referrer's code. Trigger: referrer notification via WhatsApp "Your friend just signed up! Your reward is on its way."'),
                            MN(rw,{x:1080,y:280},'Reward Delivery','email','Both parties receive reward confirmation. Referrer: credit/voucher + "Share again" prompt. Referee: welcome offer + onboarding sequence start.'),
                          ]);
                          setEdges([E(wa,lp,'e1'),E(em,lp,'e2'),E(lp,fr,'e3'),E(fr,rw,'e4')]);
                        }
                      }} className={cn("flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all hover:scale-[1.01] hover:shadow-md active:scale-100", theme === 'dark' ? "bg-white/5 border-white/10 hover:border-accent/40" : tpl.color)}>
                        <div className="text-2xl">{tpl.emoji}</div>
                        <div className="font-black text-sm leading-tight">{tpl.title}</div>
                        <div className="text-[11px] text-text-dim leading-relaxed">{tpl.desc}</div>
                        <div className={cn("mt-1 text-[9px] font-black uppercase tracking-widest", theme === 'dark' ? "text-accent/60" : "text-slate-400")}>
                          View template →
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between">
                  <button onClick={() => { setShowTemplates(false); setNodes([]); setEdges([]); }} className="text-[11px] text-text-dim hover:text-accent transition-colors">
                    → Start with blank canvas
                  </button>
                  <button onClick={() => setShowTemplates(false)} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all", theme === 'dark' ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

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

function Footer({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <footer className={cn(
      "col-span-full border-t flex items-center px-6 gap-4 text-[10px] text-text-dim opacity-40",
      theme === 'dark' ? "bg-sidebar border-border" : "bg-white border-slate-200"
    )}>
      <span className="font-black tracking-widest uppercase">Marketing Funnel Architect</span>
      <span>©ryansham.martechtalks</span>
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
             <ContextMenuItem icon={LucideIcons.LayoutGrid} label="Auto-Arrange" onClick={() => handleAction(() => useStore.getState().arrangeGrid('grid'))} theme={theme} />
             <ContextMenuItem icon={LucideIcons.Maximize} label="Fit View" onClick={() => { onClick(); document.querySelector('.react-flow__controls-fitview')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); }} theme={theme} />
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
