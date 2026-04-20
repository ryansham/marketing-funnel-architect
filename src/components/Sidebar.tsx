// Sidebar uses translations from parent App's langDict
// Import inline to avoid circular deps
const sidebarLangDict = {
  en: {
    history: 'History',
    architectMode: 'Architect Mode', architectModeDesc: {st.architectModeDesc},
    channelSelection: 'Channel Selection', nodeNameTitle: 'Node Name / Title',
    styleConfig: 'Style Configuration', visualAppearance: 'Visual Appearance',
    fillColor: 'Fill Color', borderColor: 'Border Color', borderThickness: 'Border Thickness',
    pageConfig: 'Page Configuration', pageTemplate: 'Page Template',
    mediaToolkit: 'Media Toolkit', addModule: 'Add Module',
    typographyLayout: 'Typography & Layout', alignment: 'Alignment',
    titleSize: 'Title Size', fontFamily: 'Font Family',
    spacingControls: 'Spacing Controls', letterSpacing: 'Letter Spacing', lineHeight: 'Line Height',
    addNote: 'Add a note...', expandNote: 'Expand Note', collapseNote: 'Collapse Note',
    group: 'Group', ungroup: 'Ungroup',
  },
  'zh-hk': {
    history: '歷史記錄',
    architectMode: '設計師模式', architectModeDesc: '選取畫布上的任何元素以設定其屬性。',
    channelSelection: '頻道選擇', nodeNameTitle: '節點名稱／標題',
    styleConfig: '樣式設定', visualAppearance: '視覺外觀',
    fillColor: '填充顏色', borderColor: '邊框顏色', borderThickness: '邊框粗細',
    pageConfig: '頁面設定', pageTemplate: '頁面模板',
    mediaToolkit: '媒體工具包', addModule: '新增模組',
    typographyLayout: '字型與排版', alignment: '對齊方式',
    titleSize: '標題大小', fontFamily: '字型',
    spacingControls: '間距控制', letterSpacing: '字距', lineHeight: '行距',
    addNote: '新增備注…', expandNote: '展開備注', collapseNote: '收起備注',
    group: '組合', ungroup: '取消組合',
  },
  'zh-cn': {
    history: '历史记录',
    architectMode: '设计师模式', architectModeDesc: '选择画布上的任何元素以配置其属性。',
    channelSelection: '渠道选择', nodeNameTitle: '节点名称／标题',
    styleConfig: '样式配置', visualAppearance: '视觉外观',
    fillColor: '填充颜色', borderColor: '边框颜色', borderThickness: '边框粗细',
    pageConfig: '页面配置', pageTemplate: '页面模板',
    mediaToolkit: '媒体工具包', addModule: '添加模块',
    typographyLayout: '字体与排版', alignment: '对齐方式',
    titleSize: '标题大小', fontFamily: '字体',
    spacingControls: '间距控制', letterSpacing: '字距', lineHeight: '行距',
    addNote: '添加备注…', expandNote: '展开备注', collapseNote: '收起备注',
    group: '组合', ungroup: '取消组合',
  },
} as const;
import React from 'react';
import { useStore } from '../store/useStore';
import * as LucideIcons from 'lucide-react';
import { 
  Settings, 
  Box, 
  ArrowLeft, 
  Plus, 
  Type, 
  Map as MapIcon, 
  QrCode, 
  MessageSquare, 
  Star, 
  Gift,
  Undo2,
  Redo2,
  Trash2,
  ChevronDown,
  Layout,
  MousePointer2,
  ClipboardList,
  Mail
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MockupModule } from '../types';


export default function Sidebar() {
  const [collapsed, setCollapsed] = React.useState<Record<string,boolean>>({});
  const toggle = (key: string) => setCollapsed(p => ({ ...p, [key]: !p[key] }));
  const SectionHeader = ({ label, skey }: { label: string; skey: string }) => (
    <button
      onClick={() => toggle(skey)}
      className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest font-black mb-3 opacity-50 hover:opacity-100 transition-opacity"
    >
      <span>{label}</span>
      <LucideIcons.ChevronDown size={12} className={cn("transition-transform", collapsed[skey] && "rotate-180")} />
    </button>
  );
  const { 
    selectedNodeId, 
    nodes, 
    updateNodeData, 
    addMockupModule, 
    updateMockupModules,
    reorderMockupModule,
    renameMockupModule,
    undo,
    redo,
    historyIndex,
    history,
    theme,
    createGroup,
    ungroup,
    importCampaign
  } = useStore();
  
  const lang = useStore((s) => (s as any).lang || 'en') as 'en' | 'zh-hk' | 'zh-cn';
  const st = sidebarLangDict[lang] || sidebarLangDict['en'];
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleExportJSON = () => {
    const data = { nodes: useStore.getState().nodes, edges: useStore.getState().edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funnel-architect-${Date.now()}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          importCampaign(data);
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadImage = (format: 'png' | 'jpg' | 'pdf') => {
     // This would typically use html2canvas or similar
     // For now, we'll suggest it's coming
     alert(`Exporting as ${format.toUpperCase()}... (Optimization ongoing)`);
  };

  const GlobalActions = () => (
    <div className={cn("p-4 border-b space-y-3", theme === 'dark' ? "border-border" : "border-slate-200")}>
      {/* Undo / Redo */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-text-dim font-black opacity-60">{st.history}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className={cn("p-1.5 border rounded hover:bg-black/5 disabled:opacity-20 transition-all", theme === 'dark' ? "border-border text-white" : "border-slate-200 text-slate-700")}
            title="Undo (Ctrl+Z)"
          ><LucideIcons.Undo2 size={12} /></button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={cn("p-1.5 border rounded hover:bg-black/5 disabled:opacity-20 transition-all", theme === 'dark' ? "border-border text-white" : "border-slate-200 text-slate-700")}
            title="Redo (Ctrl+Y)"
          ><LucideIcons.Redo2 size={12} /></button>
        </div>
      </div>


    </div>
  );

  if (!selectedNodeId || !selectedNode) {
    return (
      <div className="flex-1 flex flex-col">
        <GlobalActions />
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className={cn(
            "p-4 rounded-full mb-4 border",
            theme === 'dark' ? "bg-white/[0.03] border-border" : "bg-slate-100 border-slate-200"
          )}>
            <Settings className="text-text-dim" size={32} />
          </div>
          <h3 className={cn("font-semibold", theme === 'dark' ? "text-white" : "text-slate-900")}>{st.architectMode}</h3>
          <p className="text-text-dim text-[11px] mt-2 max-w-[200px]">Select any component on the canvas to configure its O2O properties.</p>
        </div>
      </div>
    );
  }

  const isLandingNode = selectedNode.type === 'landing';
  const isTextNode = selectedNode.type === 'text';
  const isTitleNode = selectedNode.type === 'title';
  const isImageNode = selectedNode.type === 'image';
  const isShapedOrMarketing = selectedNode.type === 'shape' || selectedNode.type === 'marketing';

  const channelTypes = ['facebook', 'instagram', 'youtube', 'whatsapp', 'tiktok', 'wechat', 'outdoor', 'email', 'google-ads', 'form', 'others'];
  const OTHER_ICONS = ['Globe', 'Monitor', 'Smartphone', 'MessageSquare', 'Share2', 'Tv', 'Radio', 'Newspaper', 'Mic', 'Camera', 'Video', 'ShoppingBag', 'CreditCard', 'Briefcase', 'Heart', 'Zap'];
  const pageTypes = ['Static Page', 'Squeeze Page', 'Registration CTA', 'Donation Page', 'Other'];

  const templatePresets: Record<string, MockupModule['type'][]> = {
    'Static Page': ['Hero', 'CTA', 'Subscription'],
    'Squeeze Page': ['Hero', 'Form'],
    'Registration CTA': ['Hero', 'Form', 'CTA'],
    'Donation Page': ['Hero', 'Form', 'CTA'],
  };

  const moduleTemplates: { type: MockupModule['type']; icon: any; label: string }[] = [
    { type: 'Hero', icon: Type, label: 'Hero' },
    { type: 'CTA', icon: MousePointer2, label: 'CTA' },
    { type: 'Form', icon: ClipboardList, label: 'Form' },
    { type: 'Subscription', icon: Mail, label: 'Sub' },
    { type: 'Map', icon: MapIcon, label: 'Map' },
    { type: 'QR', icon: QrCode, label: 'QR' },
    { type: 'Redemption', icon: Gift, label: 'Gift' },
    { type: 'Video', icon: LucideIcons.PlayCircle, label: 'Video' },
    { type: 'Testimonials', icon: LucideIcons.Users, label: 'Testimo' },
    { type: 'FAQ', icon: LucideIcons.HelpCircle, label: 'FAQ' },
    { type: 'Features', icon: LucideIcons.CheckCircle, label: 'Feat' },
    { type: 'Pricing', icon: LucideIcons.DollarSign, label: 'Price' },
  ];

  const handleTemplateChange = (type: string) => {
    updateNodeData(selectedNodeId!, { pageType: type });
    
    const preset = templatePresets[type];
    if (preset) {
      const newModules: MockupModule[] = preset.map(modType => ({
        id: Math.random().toString(36).substr(2, 9),
        type: modType,
        content: {}
      }));
      updateMockupModules(selectedNodeId!, newModules);
    }
  };

  const handleDeleteModule = (id: string) => {
    const filtered = (selectedNode?.data.mockupModules || []).filter(m => m.id !== id);
    updateMockupModules(selectedNodeId!, filtered);
  };

  const handleChannelSelect = (channel: string) => {
    updateNodeData(selectedNodeId!, { 
       primaryChannel: channel as any,
       label: channel === 'google-ads' ? 'Google ads' : 
              channel === 'outdoor' ? 'Billboard' : 
              channel.charAt(0).toUpperCase() + channel.slice(1)
    });
  };

  const handleAddModule = (type: MockupModule['type']) => {
    const newModule: MockupModule = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: {}
    };
    addMockupModule(selectedNodeId!, newModule);
  };

  const fontGroups = [
    { label: 'Sans Serif', fonts: ['Inter', 'Helvetica', 'Arial'] },
    { label: 'Handwriting', fonts: ['Dancing Script', 'Caveat', 'Sacramento', 'Pacifico'] },
    { label: 'Others', fonts: ['JetBrains Mono', 'Courier New'] }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <GlobalActions />
      


      {/* Settings Section */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 scrollbar-hide">
        {selectedNode.type === 'marketing' && (
          <section className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-text-dim font-black block">{st.channelSelection}</span>
            <div className="grid grid-cols-4 gap-2">
              {channelTypes.map(ct => (
                <button
                  key={ct}
                  onClick={() => handleChannelSelect(ct)}
                  className={cn(
                    "p-2 rounded border transition-all flex items-center justify-center",
                    selectedNode.data.primaryChannel === ct 
                      ? "bg-accent border-accent text-bg" 
                      : (theme === 'dark' ? "bg-white/5 border-border hover:border-slate-500" : "bg-white border-slate-200 hover:border-slate-400 shadow-sm")
                  )}
                  title={ct}
                >
                  {getIconForChannel(ct, 14, selectedNode.data.primaryChannel === ct ? selectedNode.data.customIcon : undefined)}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 pt-4">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">{st.nodeNameTitle}</label>
              <input 
                type="text"
                className={cn(
                  "w-full border rounded px-3 py-2 text-xs font-bold outline-none focus:border-accent transition-all",
                  theme === 'dark' ? "bg-black/40 border-border text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                )}
                value={selectedNode.data.label}
                onChange={(e) => updateNodeData(selectedNodeId, { label: e.target.value })}
              />
            </div>

            {selectedNode.data.primaryChannel === 'others' && (
              <div className="space-y-2 pt-4 border-t border-border/10">
                <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Source Persona Icon</label>
                <div className="grid grid-cols-6 gap-1">
                  {OTHER_ICONS.map(iconKey => {
                    const IconComp = (LucideIcons as any)[iconKey] || LucideIcons.HelpCircle;
                    return (
                      <button
                        key={iconKey}
                        onClick={() => updateNodeData(selectedNodeId!, { customIcon: iconKey })}
                        className={cn(
                          "p-2 rounded border transition-all flex items-center justify-center",
                          selectedNode.data.customIcon === iconKey 
                            ? "bg-accent border-accent text-bg" 
                            : (theme === 'dark' ? "bg-white/5 border-border hover:border-slate-500" : "bg-white border-slate-200 hover:border-slate-400 shadow-sm")
                        )}
                      >
                        <IconComp size={10} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {isLandingNode && (
          <section className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
             <span className="text-[10px] uppercase tracking-widest text-text-dim font-black block">{st.pageConfig}</span>
             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">{st.pageTemplate}</label>
                  <select 
                    className={cn(
                      "w-full border rounded px-3 py-2 text-xs font-bold outline-none focus:border-accent transition-all",
                      theme === 'dark' ? "bg-black/40 border-border text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                    )}
                    value={pageTypes.includes(selectedNode.data.pageType || '') ? selectedNode.data.pageType : 'Other'}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    {pageTypes.map(pt => (
                      <option key={pt} value={pt} className={theme === 'dark' ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>{pt}</option>
                    ))}
                  </select>
                </div>
                {(!pageTypes.includes(selectedNode.data.pageType || '') || selectedNode.data.pageType === 'Other') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Custom Layout Type</label>
                    <input 
                      type="text"
                      placeholder="e.g. Microsite"
                      className={cn(
                        "w-full border rounded px-3 py-2 text-xs font-bold outline-none focus:border-accent transition-all",
                        theme === 'dark' ? "bg-black/40 border-border text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                      )}
                      value={selectedNode.data.pageType === 'Other' ? '' : selectedNode.data.pageType}
                      onChange={(e) => updateNodeData(selectedNodeId, { pageType: e.target.value })}
                    />
                  </div>
                )}
             </div>
          </section>
        )}

        {(isTextNode || isTitleNode || selectedNode.type === 'free-text') && (
          <section className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-text-dim font-black block">{st.typographyLayout}</span>
            <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">{st.alignment}</label>
                   <div className="grid grid-cols-3 gap-1">
                      {['left', 'center', 'right'].map(align => (
                        <button 
                           key={align}
                           onClick={() => updateNodeData(selectedNodeId!, { textAlign: align as any })}
                           className={cn(
                             "py-1.5 rounded flex items-center justify-center transition-all",
                             (selectedNode.data.textAlign || 'left') === align ? "bg-accent text-bg" : "bg-black/10 text-white/50 hover:bg-black/20"
                           )}
                        >
                           {align === 'left' ? <LucideIcons.AlignLeft size={14} /> : 
                            align === 'center' ? <LucideIcons.AlignCenter size={14} /> : 
                            <LucideIcons.AlignRight size={14} />}
                        </button>
                      ))}
                   </div>
                </div>
                {isTitleNode && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">{st.titleSize}</label>
                    <div className="grid grid-cols-6 gap-1">
                      {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(h => (
                        <button 
                          key={h}
                          onClick={() => updateNodeData(selectedNodeId!, { titleType: h as any })}
                          className={cn(
                            "py-1 rounded text-[10px] font-black uppercase transition-all",
                            selectedNode.data.titleType === h ? "bg-accent text-bg" : "bg-black/10 text-white/50 hover:bg-black/20"
                          )}
                        >{h}</button>
                      ))}
                    </div>
                  </div>
                )}

                {!isTitleNode && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">Font Size</label>
                      <span className="text-xs font-bold text-accent">{selectedNode.data.fontSize || 20}px</span>
                    </div>
                    <input 
                      type="range"
                      min="12"
                      max="120"
                      value={selectedNode.data.fontSize || 20}
                      onChange={(e) => updateNodeData(selectedNodeId, { fontSize: Number(e.target.value) })}
                      className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                  </div>
                )}
                <div className="space-y-1.5 pt-4 border-t border-border/10">
                  <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">{st.spacingControls}</label>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-text-dim uppercase tracking-tighter">
                        <span>{st.letterSpacing}</span>
                        <span className="text-accent">{selectedNode.data.letterSpacing || 0}px</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={selectedNode.data.letterSpacing || 0}
                        onChange={(e) => updateNodeData(selectedNodeId, { letterSpacing: Number(e.target.value) })}
                        className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-text-dim uppercase tracking-tighter">
                        <span>{st.lineHeight}</span>
                        <span className="text-accent">{selectedNode.data.lineHeight || 1.2}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.8"
                        max="3"
                        step="0.1"
                        value={selectedNode.data.lineHeight || 1.2}
                        onChange={(e) => updateNodeData(selectedNodeId, { lineHeight: Number(e.target.value) })}
                        className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>
                  </div>
                </div>
            </div>
          </section>
        )}

        {isShapedOrMarketing && (
          <section className="space-y-4">
             <span className="text-[10px] uppercase tracking-widest text-text-dim font-black block">{st.styleConfig}</span>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">{st.visualAppearance}</label>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <span className="text-[8px] font-bold text-text-dim uppercase tracking-tight">{st.fillColor}</span>
                         <input 
                            type="color" 
                            className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden p-0 border-none"
                            value={selectedNode.data.fillColor || (selectedNode.type === 'marketing' ? '#0ea5e9' : '#ffffff')}
                            onChange={(e) => updateNodeData(selectedNodeId!, { fillColor: e.target.value })}
                         />
                      </div>
                      <div className="space-y-1">
                         <span className="text-[8px] font-bold text-text-dim uppercase tracking-tight">{st.borderColor}</span>
                         <input 
                            type="color" 
                            className="w-full h-8 bg-transparent cursor-pointer rounded overflow-hidden p-0 border-none"
                            value={selectedNode.data.strokeColor || (selectedNode.type === 'marketing' ? '#0ea5e9' : '#38bdf8')}
                            onChange={(e) => updateNodeData(selectedNodeId!, { strokeColor: e.target.value })}
                         />
                      </div>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-text-dim uppercase tracking-wider">{st.borderThickness}</label>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateNodeData(selectedNodeId!, { strokeWidth: Math.max(1, (selectedNode.data.strokeWidth || 2) - 1) })}
                          className={cn("p-1 rounded transition-colors", theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200")}
                        ><LucideIcons.ChevronDown size={12} /></button>
                        <span className="text-xs font-bold text-accent min-w-[20px] text-center">{selectedNode.data.strokeWidth || 2}</span>
                        <button 
                          onClick={() => updateNodeData(selectedNodeId!, { strokeWidth: Math.min(20, (selectedNode.data.strokeWidth || 2) + 1) })}
                          className={cn("p-1 rounded transition-colors", theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200")}
                        ><LucideIcons.ChevronUp size={12} /></button>
                      </div>
                   </div>
                   <input 
                     type="range"
                     min="1"
                     max="20"
                     value={selectedNode.data.strokeWidth || 2}
                     onChange={(e) => updateNodeData(selectedNodeId!, { strokeWidth: Number(e.target.value) })}
                     className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                   />
                </div>
             </div>
          </section>
        )}

        {isImageNode && (
          <section className="space-y-4">
             <span className="text-[10px] uppercase tracking-widest text-text-dim font-black block">Image Content</span>
             <p className="text-[10px] text-text-dim">Images and logos are stored locally in your browser for this session.</p>
          </section>
        )}

        {isLandingNode && (
          <section className={cn("pt-8 border-t", theme === 'dark' ? "border-border" : "border-slate-100")}>
            <span className="text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 block">{st.mediaToolkit}</span>
            <div className="grid grid-cols-3 gap-2">
              {moduleTemplates.map((template) => (
                <button
                  key={template.type}
                  onClick={() => handleAddModule(template.type)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 border rounded-lg transition-all group",
                    theme === 'dark' ? "bg-white/[0.03] hover:bg-white/[0.08] border-border" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  )}
                >
                  <template.icon size={14} className="text-accent" />
                  <span className="text-[9px] text-text-dim font-bold uppercase tracking-tighter">{template.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {isLandingNode && (
          <section className={cn("pt-8 border-t", theme === 'dark' ? "border-border" : "border-slate-100")}>
            <span className="text-[10px] uppercase tracking-widest text-text-dim font-black mb-4 block">Content Stack</span>
            <div className="space-y-2">
              {(selectedNode?.data.mockupModules || []).map((module: MockupModule, index: number) => (
                <div key={module.id} className={cn(
                  "flex flex-col p-2 rounded-lg border group gap-2",
                  theme === 'dark' ? "bg-black/20 border-border/50" : "bg-slate-50 border-slate-100 shadow-sm"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-text-dim">{index + 1}</span>
                      <input 
                         className={cn(
                           "text-[10px] font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-accent/30 rounded px-1",
                           theme === 'dark' ? "text-white" : "text-slate-700"
                         )}
                         value={module.label || module.type}
                         onChange={(e) => renameMockupModule(selectedNodeId!, module.id, e.target.value)}
                         onPointerDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => reorderMockupModule(selectedNodeId!, module.id, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-black/5 disabled:opacity-20 rounded"
                        title="Move Up"
                      ><LucideIcons.ArrowUp size={10} /></button>
                      <button 
                        onClick={() => reorderMockupModule(selectedNodeId!, module.id, 'down')}
                        disabled={index === (selectedNode?.data.mockupModules?.length || 0) - 1}
                        className="p-1 hover:bg-black/5 disabled:opacity-20 rounded"
                        title="Move Down"
                      ><LucideIcons.ArrowDown size={10} /></button>
                      <button 
                        onClick={() => handleDeleteModule(module.id)}
                        className="p-1 text-red-400 hover:text-red-500 rounded"
                        title="Remove"
                      ><Trash2 size={10} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {(selectedNode?.data.mockupModules?.length === 0) && (
                <div className="text-center py-4 border border-dashed rounded-lg opacity-30 text-[9px] font-black uppercase">
                  Empty Stack
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function getIconForChannel(ct: string, size: number, customIcon?: string) {
  if (customIcon) {
     const IconComp = (LucideIcons as any)[customIcon] || LucideIcons.HelpCircle;
     return <IconComp size={size} />;
  }
  const iconMap: Record<string, any> = {
    facebook: LucideIcons.Facebook,
    instagram: LucideIcons.Instagram,
    youtube: LucideIcons.Youtube,
    whatsapp: LucideIcons.MessageCircle,
    tiktok: LucideIcons.Smartphone,
    wechat: LucideIcons.MessageSquare,
    outdoor: LucideIcons.LayoutTemplate,
    email: LucideIcons.Mail,
    'google-ads': LucideIcons.Search,
    form: LucideIcons.ClipboardList,
    others: LucideIcons.HelpCircle
  };
  const Icon = iconMap[ct] || LucideIcons.HelpCircle;
  return <Icon size={size} />;
}
