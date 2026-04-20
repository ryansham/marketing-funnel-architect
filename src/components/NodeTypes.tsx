import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeResizer, BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils';
import { NodeType, MockupModule } from '../types';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { useStore } from '../store/useStore';

// ─── Type Configs ───────────────────────────────────────────────────────────────

const typeConfig: Record<NodeType, { color: string; border: string; accent: string }> = {
  discovery: { color: 'text-discovery', border: 'border-discovery', accent: '#3b82f6' },
  direct:    { color: 'text-direct',    border: 'border-direct',    accent: '#22c55e' },
  owned:     { color: 'text-owned',     border: 'border-owned',     accent: '#a855f7' },
  physical:  { color: 'text-physical',  border: 'border-physical',  accent: '#f97316' },
  sticky:    { color: 'text-yellow-400', border: 'border-yellow-400/50', accent: '#eab308' },
  text:      { color: 'text-white',     border: 'border-white/10',  accent: '#ffffff' },
  title:     { color: 'text-accent',    border: 'border-accent/40', accent: '#38bdf8' },
  image:     { color: 'text-white',     border: 'border-white/10',  accent: '#ffffff' },
  preset:    { color: 'text-accent',    border: 'border-accent',    accent: '#38bdf8' },
  shape:     { color: 'text-white',     border: 'border-white/10',  accent: '#ffffff' },
  group:     { color: 'text-white',     border: 'border-white/10',  accent: '#ffffff' },
};

// ─── Channel Config (rich brand colours + logo flag) ───────────────────────────

const channelConfig: Record<string, { color: string; icon: string; brandLogo?: string }> = {
  whatsapp:     { color: '#25D366', icon: 'MessageCircle', brandLogo: 'whatsapp' },
  facebook:     { color: '#1877F2', icon: 'Facebook',      brandLogo: 'facebook' },
  instagram:    { color: '#E4405F', icon: 'Instagram',     brandLogo: 'instagram' },
  youtube:      { color: '#FF0000', icon: 'Youtube',       brandLogo: 'youtube' },
  tiktok:       { color: '#010101', icon: 'Smartphone',    brandLogo: 'tiktok' },
  wechat:       { color: '#07C160', icon: 'MessageSquare', brandLogo: 'wechat' },
  outdoor:      { color: '#f97316', icon: 'LayoutTemplate' },
  email:        { color: '#64748b', icon: 'Mail' },
  'google-ads': { color: '#4285F4', icon: 'Search',        brandLogo: 'google' },
  form:         { color: '#0ea5e9', icon: 'ClipboardList' },
  others:       { color: '#94a3b8', icon: 'HelpCircle' },
};

// ─── Inline Brand Logo SVGs ────────────────────────────────────────────────────

function BrandLogo({ brand, size = 20, color }: { brand: string; size?: number; color: string }) {
  const s = size;
  switch (brand) {
    case 'whatsapp':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    case 'wechat':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill={color}>
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 01.176-.554 5.48 5.48 0 002.5-4.629c-.004-3.076-2.81-5.864-6.058-6.114zm-2.497 3.33c.535 0 .969.441.969.983a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.983.969-.983zm4.943 0c.535 0 .969.441.969.983a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.983.969-.983z"/>
        </svg>
      );
    case 'google':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    default:
      return null;
  }
}

// ─── Highlight hook ────────────────────────────────────────────────────────────
// Returns whether this node is highlighted or dimmed based on the selected node.

function useHighlight(id: string) {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const edges          = useStore((s) => s.edges);

  return useMemo(() => {
    if (!selectedNodeId) return { isHighlighted: false, isDimmed: false };
    if (selectedNodeId === id) return { isHighlighted: true, isDimmed: false };
    const connected = edges.some(
      (e) => (e.source === selectedNodeId && e.target === id) ||
             (e.target === selectedNodeId && e.source === id)
    );
    // No dimming — only highlight connected nodes, leave others normal
    return { isHighlighted: connected, isDimmed: false };
  }, [selectedNodeId, id, edges]);
}

// ─── Shared Handle set ─────────────────────────────────────────────────────────

function NodeHandles({ visible, color = '#38bdf8' }: { visible: boolean; color?: string }) {
  // Primary handles (left/right) — always rendered, shown on hover/select via CSS
  const primaryCls = `!w-3 !h-3 !border-2 !border-white !rounded-full transition-all duration-150 hover:!scale-150`;
  const secondaryCls = `!w-2.5 !h-2.5 !border-2 !border-white/70 !rounded-full transition-all duration-150`;
  const primaryStyle = { backgroundColor: color, opacity: visible ? 1 : 0, transition: 'opacity 0.15s' };
  const secondaryStyle = { backgroundColor: color, opacity: visible ? 0.6 : 0, transition: 'opacity 0.15s' };
  return (
    <>
      <Handle id="left"   type="target" position={Position.Left}   className={cn(primaryCls, '!-left-1.5')}   style={primaryStyle} />
      <Handle id="right"  type="source" position={Position.Right}  className={cn(primaryCls, '!-right-1.5')}  style={primaryStyle} />
      <Handle id="top"    type="target" position={Position.Top}    className={cn(secondaryCls, '!-top-1.5')}    style={secondaryStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={cn(secondaryCls, '!-bottom-1.5')} style={secondaryStyle} />
    </>
  );
}

// ─── MarketingNode ─────────────────────────────────────────────────────────────

export const MarketingNode = memo(({ id, data, selected }: any) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const showNumbers    = useStore((s) => s.showNumbers);
  const theme          = useStore((s) => s.theme);
  const bringToFront   = useStore((s) => s.bringToFront);
  const sendToBack     = useStore((s) => s.sendToBack);
  const isConnecting   = useStore((s) => s.isConnecting);
  const { isHighlighted, isDimmed } = useHighlight(id);

  const channelData    = data.primaryChannel ? channelConfig[data.primaryChannel] : null;
  const config         = typeConfig[data.type as NodeType] || typeConfig.discovery;
  const customIconName = data.customIcon || (channelData ? channelData.icon : (data.icon || 'HelpCircle'));
  const Icon           = (LucideIcons as any)[customIconName] || LucideIcons.HelpCircle;
  const accentColor    = data.strokeColor || (channelData ? channelData.color : config.accent);
  // Use subtle brand tint for channel cards, or explicit fillColor, or default
  const defaultBg = theme === 'dark' ? 'rgb(30, 41, 59)' : 'rgb(255, 255, 255)';
  const brandTint = channelData ? `${channelData.color}12` : null; // 12 = ~7% opacity hex
  const bgColor   = data.fillColor || (isDiscovery && brandTint ? brandTint : defaultBg);

  const isDiscovery = data.type === 'discovery';
  const isAds       = data.primaryChannel === 'google-ads' ||
                      (data.primaryChannel === 'others' && data.label?.toLowerCase().includes('ads'));
  const hasBrand    = !!channelData?.brandLogo;

  const activeShadow    = `0 8px 32px -4px ${accentColor}40, 0 0 0 2px ${accentColor}30`;
  const highlightShadow = `0 0 0 2px ${accentColor}80, 0 8px 24px -4px ${accentColor}30`;
  const defaultShadow   = `0 4px 16px -4px ${accentColor}20`;

  return (
    <div
      className={cn(
        'border transition-all duration-200 relative group/card cursor-pointer',
        isDiscovery ? 'rounded-full px-6 py-3' : 'rounded-xl',
        isDiscovery ? 'min-w-[180px]' : 'w-[220px]',
        isAds && 'border-2',
        // dimming removed for better UX
        isHighlighted && !selected  ? 'scale-[1.03]' : '',
        selected                    ? 'scale-[1.02]' : 'hover:scale-[1.01]',
      )}
      style={{
        backgroundColor: bgColor,
        borderLeft:  isDiscovery ? undefined : `4px solid ${accentColor}`,
        borderColor: isDiscovery ? accentColor : (isAds ? accentColor : undefined),
        boxShadow:   selected ? activeShadow : isHighlighted ? highlightShadow : defaultShadow,
        transition:  'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
      }}
    >
      <NodeHandles visible={selected || isConnecting} color={accentColor} />

      {selected && (
        <div className={cn(
          'absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-lg shadow-xl z-50 border',
          theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200',
        )}>
          <button onClick={() => bringToFront(id)} className={cn('p-1.5 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-600')} title="Bring to Front">
            <LucideIcons.ArrowUpNarrowWide size={12} />
          </button>
          <button onClick={() => sendToBack(id)} className={cn('p-1.5 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-600')} title="Send to Back">
            <LucideIcons.ArrowDownNarrowWide size={12} />
          </button>
        </div>
      )}

      <div className={cn(isDiscovery ? 'flex items-center gap-3' : 'p-3 space-y-2.5')}>
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2 truncate flex-1">

            {/* Brand logo or Lucide icon */}
            <div
              className={cn(
                'p-1.5 rounded-lg shrink-0 flex items-center justify-center transition-all duration-200',
                theme === 'dark' ? 'bg-white/5' : 'bg-slate-50',
              )}
              style={{ boxShadow: `0 0 0 1px ${accentColor}25` }}
            >
              {hasBrand ? (
                <BrandLogo brand={channelData!.brandLogo!} size={isDiscovery ? 20 : 16} color={accentColor} />
              ) : (
                <Icon size={isDiscovery ? 20 : 16} style={{ color: accentColor }} />
              )}
            </div>

            {selected ? (
              <input
                className={cn(
                  'text-[10px] font-black truncate tracking-tight py-1 bg-transparent border-none outline-none focus:ring-1 focus:ring-accent/30 rounded px-1 w-full',
                  theme === 'dark' ? 'text-white' : 'text-slate-900',
                )}
                autoFocus
                value={data.label}
                onChange={(e) => updateNodeData(id, { label: e.target.value })}
                onPointerDown={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={cn(
                'text-[10px] font-black truncate tracking-tight py-1',
                theme === 'dark' ? 'text-white' : 'text-slate-900',
                isDiscovery && 'text-xs px-1',
              )}>{data.label}</span>
            )}
          </div>
        </div>

        {!isDiscovery && showNumbers && (
          <div className="flex flex-col gap-0.5">
            <div className="text-[9px] font-black text-text-dim uppercase tracking-wider opacity-50">Reach Potential</div>
            <div className={cn('text-sm font-bold tracking-tight', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              {data.volume.toLocaleString()}
            </div>
          </div>
        )}

        {!isDiscovery && (
          <div className="space-y-1">
            <button
              onClick={() => updateNodeData(id, { expanded: !data.expanded })}
              className="w-full flex items-center justify-between px-2 py-1 bg-black/10 rounded text-[9px] font-bold text-text-dim hover:text-white transition-colors"
            >
              <span>{data.expanded ? 'Collapse Note' : 'Expand Note'}</span>
              <LucideIcons.ChevronDown size={10} className={cn('transition-transform', data.expanded && 'rotate-180')} />
            </button>
            {data.expanded && (
              <textarea
                className={cn(
                  'w-full border border-white/5 rounded p-1.5 text-[10px] outline-none focus:border-accent/40 h-16 resize-none transition-all font-medium leading-relaxed mt-1 animate-in slide-in-from-top-1',
                  theme === 'dark' ? 'bg-black/20 text-white/80 placeholder:text-white/20' : 'bg-slate-50 text-slate-700 placeholder:text-black',
                )}
                placeholder="Marketing notes..."
                autoFocus
                value={data.note || ''}
                onChange={(e) => updateNodeData(id, { note: e.target.value })}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// ─── WireframeModule ───────────────────────────────────────────────────────────

const WireframeModule = ({ type, label, theme }: { type: string; label?: string; theme: 'dark' | 'light' }) => {
  const isDark      = theme === 'dark';
  const strokeColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const fillColor   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const displayName = label || type;

  switch (type) {
    case 'Hero':
      return (
        <div className="w-full aspect-[16/7] border rounded flex flex-col items-center justify-center relative overflow-hidden mb-1" style={{ borderColor: strokeColor, backgroundColor: fillColor }}>
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <line x1="0" y1="0" x2="100%" y2="100%" stroke={strokeColor} strokeWidth="0.5" />
              <line x1="100%" y1="0" x2="0" y2="100%" stroke={strokeColor} strokeWidth="0.5" />
            </svg>
          </div>
          <LucideIcons.Image size={12} className="text-accent opacity-20" />
          <span className="text-[5px] font-black uppercase tracking-tighter mt-0.5 opacity-60">{displayName}</span>
        </div>
      );
    case 'CTA':
      return (
        <div className="w-full flex flex-col items-center gap-1 py-2 mb-1">
          <div className="w-2/3 h-1 rounded-full" style={{ backgroundColor: strokeColor }} />
          <div className="w-1/2 h-3.5 rounded bg-accent flex items-center justify-center text-[5px] font-black uppercase text-bg">{displayName}</div>
        </div>
      );
    case 'Features':
      return (
        <div className="grid grid-cols-2 gap-1 mb-1">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex flex-col gap-0.5 p-1 border rounded" style={{ borderColor: strokeColor, backgroundColor: fillColor }}>
              <div className="aspect-video rounded-sm bg-accent/5 flex items-center justify-center">
                <LucideIcons.Check size={6} className="text-accent opacity-30" />
              </div>
              <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: strokeColor }} />
              <div className="w-2/3 h-0.5 rounded-full opacity-50" style={{ backgroundColor: strokeColor }} />
            </div>
          ))}
          <div className="col-span-2 text-center text-[4px] font-black opacity-50 uppercase">{displayName}</div>
        </div>
      );
    case 'FAQ':
      return (
        <div className="space-y-1 mb-1 p-1 border rounded" style={{ borderColor: strokeColor, backgroundColor: fillColor }}>
          <div className="text-[4px] font-black opacity-50 uppercase mb-1">{displayName}</div>
          {[1,2].map(i => (
            <div key={i} className="border-b py-1 flex items-center justify-between last:border-0" style={{ borderColor: strokeColor }}>
              <div className="w-2/3 h-0.5 rounded-full" style={{ backgroundColor: strokeColor }} />
              <LucideIcons.Plus size={6} className="opacity-30" />
            </div>
          ))}
        </div>
      );
    case 'Subscription':
      return (
        <div className="p-2 border rounded-lg flex flex-col items-center gap-1 mb-1" style={{ borderColor: strokeColor, backgroundColor: fillColor }}>
          <div className="w-3/4 h-1 rounded-full" style={{ backgroundColor: strokeColor }} />
          <div className="w-full h-4 rounded border mt-0.5" style={{ borderColor: strokeColor, backgroundColor: isDark ? 'black' : 'white' }} />
          <div className="w-full h-4 rounded bg-accent text-[5px] font-black text-white flex items-center justify-center uppercase">{displayName}</div>
        </div>
      );
    default:
      return (
        <div className="w-full h-8 border rounded flex items-center px-2 gap-1 mb-1" style={{ borderColor: strokeColor, backgroundColor: fillColor }}>
          <LucideIcons.Square size={10} className="opacity-30" />
          <div className="flex-1 space-y-0.5">
            <div className="w-1/2 h-0.5 rounded-full" style={{ backgroundColor: strokeColor }} />
            <div className="w-1/3 h-0.5 rounded-full opacity-50" style={{ backgroundColor: strokeColor }} />
          </div>
          <span className="text-[4px] font-black uppercase opacity-50">{displayName}</span>
        </div>
      );
  }
};

// ─── LandingPageNode ───────────────────────────────────────────────────────────

export const LandingPageNode = memo(({ id, data, selected }: any) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const theme          = useStore((s) => s.theme);
  const bringToFront   = useStore((s) => s.bringToFront);
  const sendToBack     = useStore((s) => s.sendToBack);
  const isConnecting   = useStore((s) => s.isConnecting);
  const { isHighlighted, isDimmed } = useHighlight(id);

  return (
    <div
      onClick={() => bringToFront(id)}
      className={cn(
        'rounded-[32px] border transition-all duration-200 shadow-2xl relative flex flex-col p-1.5',
        theme === 'dark' ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-300',
        selected         ? 'ring-2 ring-accent scale-[1.02] z-50'  : 'hover:border-slate-500 hover:scale-[1.01]',
        // dimming removed
        isHighlighted && !selected ? 'ring-2 ring-purple-400 scale-[1.03]' : '',
      )}
      style={{ width: data.width || 180, height: data.height || 320 }}
    >
      <NodeHandles visible={selected || isConnecting} color="#a855f7" />

      {selected && (
        <div className={cn(
          'absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-lg shadow-xl z-50 border',
          theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200',
        )}>
          <button onClick={() => bringToFront(id)} className={cn('p-1.5 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-600')} title="Bring to Front">
            <LucideIcons.ArrowUpNarrowWide size={12} />
          </button>
          <button onClick={() => sendToBack(id)} className={cn('p-1.5 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-600')} title="Send to Back">
            <LucideIcons.ArrowDownNarrowWide size={12} />
          </button>
        </div>
      )}

      <NodeResizer isVisible={selected} onResize={(_, { width, height }) => updateNodeData(id, { width, height })} minWidth={150} minHeight={250} />

      <div className={cn('absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full z-20', theme === 'dark' ? 'bg-white/20' : 'bg-black/10')} />

      <div className={cn('flex-1 w-full rounded-[24px] overflow-hidden flex flex-col relative border shadow-inner', theme === 'dark' ? 'bg-black border-white/5' : 'bg-white border-slate-200')}>
        <div className={cn('pt-1.5 px-3 pb-1.5 text-center border-b', theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50')}>
          <p className={cn('text-[8px] font-black truncate uppercase tracking-tighter opacity-70', theme === 'dark' ? 'text-white' : 'text-slate-900')}>{data.label}</p>
        </div>
        <div className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-hide">
          {data.mockupModules?.length ? data.mockupModules.map((m: any) => (
            <WireframeModule key={m.id} type={m.type} label={m.label} theme={theme} />
          )) : (
            <div className={cn('h-full flex flex-col items-center justify-center opacity-10 gap-2', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
              <LucideIcons.Globe size={24} />
              <p className="text-[6px] font-black uppercase">Draft State</p>
            </div>
          )}
        </div>
      </div>

      <div className={cn('absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full opacity-20', theme === 'dark' ? 'bg-white' : 'bg-black')} />
    </div>
  );
});

// ─── StickyNoteNode ────────────────────────────────────────────────────────────

export const StickyNoteNode = memo(({ id, data, selected }: any) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const isConnecting   = useStore((s) => s.isConnecting);
  const { isDimmed, isHighlighted } = useHighlight(id);

  return (
    <div
      className={cn(
        'bg-[#fefce8] p-1 shadow-lg relative transition-all group flex flex-col cursor-text',
        selected ? 'ring-2 ring-yellow-400 rotate-0 z-50 border-yellow-200' : '-rotate-1 border border-yellow-200',
        // dimming removed
        isHighlighted && !selected ? 'ring-2 ring-yellow-300 scale-[1.02]' : '',
      )}
      style={{ width: data.width || 220, height: data.height || 180 }}
    >
      <NodeHandles visible={selected || isConnecting} color="#eab308" />
      <NodeResizer minWidth={100} minHeight={100} isVisible={selected} lineClassName="border-yellow-400" handleClassName="h-2 w-2 bg-white border border-yellow-400 rounded-sm" onResize={(_, { width, height }) => updateNodeData(id, { width, height })} />

      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-yellow-300 to-transparent pointer-events-none opacity-30" />

      <div className="flex-1 overflow-hidden h-full flex flex-col no-toolbar-editor quill-wrapper" onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <ReactQuill theme="snow" value={data.note || ''} onChange={(val) => updateNodeData(id, { note: val })} modules={{ toolbar: false }} placeholder="New sticky note..." className="rich-editor-canvas h-full text-slate-800" />
      </div>
    </div>
  );
});

// ─── TitleNode ─────────────────────────────────────────────────────────────────

export const TitleNode = memo(({ id, data, selected }: any) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const theme          = useStore((s) => s.theme);
  const bringToFront   = useStore((s) => s.bringToFront);
  const isConnecting   = useStore((s) => s.isConnecting);

  return (
    <div onClick={() => bringToFront(id)} className={cn('p-2 transition-all flex flex-col min-w-[300px]', selected ? 'ring-1 ring-accent/30' : '')}>
      <NodeHandles visible={selected || isConnecting} color="#38bdf8" />
      <textarea
        className={cn('bg-transparent border-none p-0 m-0 w-full outline-none focus:ring-0 resize-none overflow-hidden font-display text-4xl font-black tracking-tighter leading-[0.85]', data.textAlign === 'center' ? 'text-center' : data.textAlign === 'right' ? 'text-right' : 'text-left', theme === 'dark' ? 'text-white' : 'text-slate-900')}
        style={{ height: 'auto', fontFamily: data.fontFamily || 'Montserrat', letterSpacing: `${data.letterSpacing || 0}px`, lineHeight: data.lineHeight || 0.9, marginBottom: '-4px' }}
        placeholder="Headline"
        value={data.label || ''}
        onChange={(e) => { updateNodeData(id, { label: e.target.value }); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <textarea
        className={cn('bg-transparent border-none p-0 m-0 w-full outline-none focus:ring-0 resize-none overflow-hidden font-sans text-lg font-bold opacity-70 leading-none', data.textAlign === 'center' ? 'text-center' : data.textAlign === 'right' ? 'text-right' : 'text-left', theme === 'dark' ? 'text-white' : 'text-slate-900')}
        style={{ height: 'auto', fontFamily: data.fontFamily2 || 'Roboto' }}
        placeholder="Objective..."
        value={data.label2 || 'Objective: '}
        onChange={(e) => { updateNodeData(id, { label2: e.target.value }); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
        onPointerDown={(e) => e.stopPropagation()}
      />
      {selected && <TitleFloatingToolbar id={id} data={data} />}
    </div>
  );
});

// ─── ImageNode ─────────────────────────────────────────────────────────────────

export const ImageNode = memo(({ id, data, selected }: any) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const theme          = useStore((s) => s.theme);
  const isConnecting   = useStore((s) => s.isConnecting);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateNodeData(id, { imageUrl: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn('p-1 border rounded-xl overflow-hidden shadow-xl transition-all relative group', theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200', selected ? 'ring-2 ring-accent' : 'hover:shadow-2xl hover:scale-[1.01]')} style={{ width: data.width || 200, height: data.height || 200 }}>
      <NodeHandles visible={selected || isConnecting} color="#38bdf8" />
      <NodeResizer isVisible={selected} onResize={(_, { width, height }) => updateNodeData(id, { width, height })} />
      {data.imageUrl ? (
        <img src={data.imageUrl} alt="Node" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
      ) : (
        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-2">
          <LucideIcons.ImagePlus size={32} className="text-text-dim" />
          <span className="text-[10px] uppercase font-black text-text-dim">Tap to upload Logo/Image</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      )}
      {selected && data.imageUrl && (
        <button onClick={() => updateNodeData(id, { imageUrl: undefined })} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <LucideIcons.X size={12} />
        </button>
      )}
    </div>
  );
});

// ─── FreeTextNode ──────────────────────────────────────────────────────────────

export const FreeTextNode = memo(({ id, data, selected }: any) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const theme          = useStore((s) => s.theme);
  const isConnecting   = useStore((s) => s.isConnecting);

  return (
    <div className={cn('p-2 transition-all group relative', selected ? 'ring-1 ring-accent/30' : '')} style={{ width: data.width || 220, height: data.height || 100, minWidth: 100 }}>
      <NodeHandles visible={selected || isConnecting} color="#38bdf8" />
      <NodeResizer minWidth={100} isVisible={selected} onResize={(_, { width, height }) => updateNodeData(id, { width, height })} />
      <div
        className="flex-1 overflow-hidden h-full flex flex-col no-toolbar-editor quill-wrapper"
        onMouseDown={(e) => { if ((e.target as HTMLElement).closest('.ql-editor')) e.stopPropagation(); }}
        onPointerDown={(e) => { if ((e.target as HTMLElement).closest('.ql-editor')) e.stopPropagation(); }}
        style={{ fontFamily: data.fontFamily || 'Dancing Script', textAlign: data.textAlign || 'left', letterSpacing: `${data.letterSpacing || 0}px`, lineHeight: data.lineHeight || 1.4, color: theme === 'dark' ? 'white' : 'black' }}
      >
        <ReactQuill theme="snow" value={data.note || ''} onChange={(val) => updateNodeData(id, { note: val })} modules={{ toolbar: false }} placeholder="Marketing notes..." className={cn('rich-editor-canvas h-full', theme === 'light' ? 'text-black' : 'text-white')} />
      </div>
      {selected && <FloatingToolbar id={id} data={data} />}
    </div>
  );
});

// ─── ShapeNode ─────────────────────────────────────────────────────────────────

export const ShapeNode = memo(({ id, data, selected }: any) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const theme          = useStore((s) => s.theme);
  const bringToFront   = useStore((s) => s.bringToFront);
  const sendToBack     = useStore((s) => s.sendToBack);
  const isConnecting   = useStore((s) => s.isConnecting);
  const type = data.shapeType || 'square';

  return (
    <div
      className={cn('relative group transition-all', selected ? 'ring-2 ring-accent ring-offset-4 ring-offset-bg z-50' : 'hover:opacity-90')}
      onClick={() => bringToFront(id)}
      style={{ width: data.width || 100, height: data.height || 100, transform: `rotate(${data.rotation || 0}deg)` }}
    >
      {(selected || isConnecting) && (
        <>
          <Handle type="target"  position={Position.Left}   className="!bg-accent !border-bg !w-2 !h-2" />
          <Handle type="target"  position={Position.Top}    className="!bg-accent !border-bg !w-2 !h-2" />
          <Handle type="source"  position={Position.Bottom} className="!bg-accent !border-bg !w-2 !h-2" />
          <Handle type="source"  position={Position.Right}  className="!bg-accent !border-bg !w-2 !h-2" />
          <div className={cn('absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-lg shadow-xl z-50 border', theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200')}>
            <button onClick={() => bringToFront(id)} className={cn('p-1.5 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-600')} title="Bring to Front"><LucideIcons.ArrowUpNarrowWide size={12} /></button>
            <button onClick={() => sendToBack(id)} className={cn('p-1.5 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-600')} title="Send to Back"><LucideIcons.ArrowDownNarrowWide size={12} /></button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <div className="flex items-center gap-1 px-1">
              <LucideIcons.RotateCw size={10} className="text-text-dim" />
              <input type="number" className="w-8 bg-transparent text-[10px] font-mono outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={data.rotation || 0} onChange={(e) => updateNodeData(id, { rotation: parseInt(e.target.value) || 0 })} onPointerDown={(e) => e.stopPropagation()} />
            </div>
          </div>
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-accent bg-sidebar flex items-center justify-center cursor-alias hover:scale-110 active:scale-95 transition-all shadow-xl z-50 group/rotate"
            onPointerDown={(e) => {
              e.stopPropagation();
              const nodeElement = e.currentTarget.parentElement?.getBoundingClientRect();
              if (!nodeElement) return;
              const centerX = nodeElement.left + nodeElement.width / 2;
              const centerY = nodeElement.top + nodeElement.height / 2;
              const handleMouseMove = (moveEvent: PointerEvent) => {
                const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
                let deg = angle * (180 / Math.PI) + 90;
                if (moveEvent.shiftKey) deg = Math.round(deg / 15) * 15;
                updateNodeData(id, { rotation: deg });
              };
              const handleMouseUp = () => { window.removeEventListener('pointermove', handleMouseMove); window.removeEventListener('pointerup', handleMouseUp); };
              window.addEventListener('pointermove', handleMouseMove);
              window.addEventListener('pointerup', handleMouseUp);
            }}
          >
            <LucideIcons.RotateCw size={14} className="text-accent group-hover/rotate:rotate-180 transition-transform duration-500" />
            <div className="absolute top-full h-8 w-[1px] bg-accent/40 pointer-events-none" />
          </div>
        </>
      )}

      {selected && (
        <NodeResizer isVisible={selected} onResize={(_, { width, height }) => updateNodeData(id, { width, height })} handleClassName={cn('h-1.5 w-1.5 !bg-accent !border-none !rounded-none', (type === 'line' || type === 'dotted-line') ? '!h-3 !w-1' : '')} />
      )}

      {type === 'line' || type === 'dotted-line' ? (
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <div className="w-full" style={{ borderBottom: `${data.strokeWidth || 2}px ${type === 'dotted-line' ? 'dashed' : 'solid'} ${data.strokeColor || '#38bdf8'}` }} />
        </div>
      ) : (
        <div className={cn('w-full h-full border transition-all duration-200 relative', type === 'circle' ? 'rounded-full' : 'rounded-sm')} style={{ backgroundColor: data.fillColor || '#38bdf8', borderColor: data.strokeColor || '#38bdf8', borderWidth: `${data.strokeWidth || 2}px` }}>
          {/* Label badge for background containers */}
          {data.label && (data.fillColor?.includes('rgba') || data.fillColor?.includes('0.')) && (
            <div className="absolute -top-5 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest" style={{ color: data.strokeColor || '#38bdf8', backgroundColor: theme === 'dark' ? 'rgba(2,6,23,0.8)' : 'rgba(248,250,252,0.9)' }}>
              <LucideIcons.Layers size={9} />
              {data.label}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ─── GroupNode ─────────────────────────────────────────────────────────────────

export const GroupNode = memo(({ id, data, selected }: any) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const theme          = useStore((s) => s.theme);

  return (
    <div
      className={cn('w-full h-full border-2 rounded-2xl relative group transition-all', theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-slate-100/50 border-slate-300', selected ? 'border-accent ring-2 ring-accent/20' : 'border-dashed hover:border-accent/40')}
      style={{ pointerEvents: 'none' }}
    >
      {/* Label — re-enable pointer events only for interactive parts */}
      <div className="absolute -top-3 left-4 px-2 bg-accent rounded text-[8px] font-black uppercase text-bg tracking-widest z-10 flex items-center gap-2" style={{ pointerEvents: 'all' }}>
        <LucideIcons.Layers size={10} />
        {data.label || 'Group'}
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ pointerEvents: 'all' }}>
        <input className={cn('bg-transparent border-none text-[8px] font-black text-right focus:ring-0 outline-none w-20', theme === 'dark' ? 'text-text-dim/80' : 'text-text-dim')} value={data.label || ''} onChange={(e) => updateNodeData(id, { label: e.target.value })} onPointerDown={(e) => e.stopPropagation()} />
      </div>
    </div>
  );
});

// ─── TitleFloatingToolbar ──────────────────────────────────────────────────────

const TitleFloatingToolbar = ({ id, data }: { id: string; data: any }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const theme          = useStore((s) => s.theme);

  const fontGroups = [
    { label: 'Display (Headline)', fonts: ['Montserrat', 'Space Grotesk', 'Outfit', 'Inter'] },
    { label: 'Content (Objective)', fonts: ['Roboto', 'Inter', 'Helvetica'] },
    { label: 'Handwriting', fonts: ['Dancing Script', 'Caveat', 'Sacramento', 'Pacifico'] },
    { label: 'Others', fonts: ['JetBrains Mono', 'Courier New'] },
  ];

  return (
    <div className={cn('absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 border rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in slide-in-from-bottom-2', theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200')} onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-1 px-1">
        <span className={cn('text-[7px] uppercase font-bold', theme === 'dark' ? 'text-white/40' : 'text-slate-400')}>Headline Font</span>
        <select className={cn('text-[9px] border-none rounded px-1.5 h-5 font-bold outline-none cursor-pointer', theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')} value={data.fontFamily || 'Montserrat'} onChange={(e) => updateNodeData(id, { fontFamily: e.target.value })}>
          {fontGroups.map(g => <optgroup key={g.label} label={g.label}>{g.fonts.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>)}
        </select>
      </div>
      <div className={cn('h-6 w-[1px] mx-1', theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')} />
      <div className="flex flex-col gap-1 px-1">
        <span className={cn('text-[7px] uppercase font-bold', theme === 'dark' ? 'text-white/40' : 'text-slate-400')}>Objective Font</span>
        <select className={cn('text-[9px] border-none rounded px-1.5 h-5 font-bold outline-none cursor-pointer', theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')} value={data.fontFamily2 || 'Roboto'} onChange={(e) => updateNodeData(id, { fontFamily2: e.target.value })}>
          {fontGroups.map(g => <optgroup key={g.label} label={g.label}>{g.fonts.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>)}
        </select>
      </div>
      <div className={cn('h-6 w-[1px] mx-1', theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')} />
      <div className={cn('flex items-center gap-1 rounded-lg p-1', theme === 'dark' ? 'bg-white/5' : 'bg-slate-50')}>
        {(['left', 'center', 'right'] as const).map(align => (
          <button key={align} onClick={() => updateNodeData(id, { textAlign: align })} className={cn('p-1 rounded', (data.textAlign || 'left') === align ? 'text-accent bg-accent/10' : theme === 'dark' ? 'text-white/60' : 'text-slate-400')}>
            {align === 'left' ? <LucideIcons.AlignLeft size={12} /> : align === 'center' ? <LucideIcons.AlignCenter size={12} /> : <LucideIcons.AlignRight size={12} />}
          </button>
        ))}
      </div>
      <div className={cn('h-6 w-[1px] mx-1', theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')} />
      <div className="flex flex-col gap-1 px-1">
        <span className={cn('text-[7px] uppercase font-bold', theme === 'dark' ? 'text-white/40' : 'text-slate-400')}>Spacing</span>
        <div className="flex items-center gap-1">
          <button onClick={() => updateNodeData(id, { letterSpacing: Math.min(10, (data.letterSpacing || 0) + 0.5) })} className={cn('p-1 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-200 text-slate-600')} title="Increase Tracking"><LucideIcons.ArrowLeftRight size={10} /></button>
          <button onClick={() => updateNodeData(id, { lineHeight: Math.min(3, (data.lineHeight || 1.1) + 0.1) })} className={cn('p-1 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-200 text-slate-600')} title="Increase Leading"><LucideIcons.ArrowUpDown size={10} /></button>
          <button onClick={() => updateNodeData(id, { letterSpacing: 0, lineHeight: 1.1 })} className={cn('p-1 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-200 text-slate-400')} title="Reset"><LucideIcons.RefreshCw size={10} /></button>
        </div>
      </div>
    </div>
  );
};

// ─── FloatingToolbar ───────────────────────────────────────────────────────────

const FloatingToolbar = ({ id, data }: { id: string; data: any }) => {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const theme          = useStore((s) => s.theme);

  const fontGroups = [
    { label: 'Sans Serif', fonts: ['Inter', 'Helvetica', 'Arial'] },
    { label: 'Handwriting', fonts: ['Dancing Script', 'Caveat', 'Sacramento', 'Pacifico'] },
    { label: 'Others', fonts: ['JetBrains Mono', 'Courier New'] },
  ];

  return (
    <div className={cn('absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 border rounded-lg shadow-2xl z-50 animate-in fade-in zoom-in slide-in-from-bottom-2', theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200')} onPointerDown={(e) => e.stopPropagation()}>
      <select className={cn('text-[10px] border-none rounded px-2 h-6 font-bold outline-none', theme === 'dark' ? 'bg-black/40 text-white' : 'bg-slate-100 text-slate-900')} value={data.fontFamily || 'Dancing Script'} onChange={(e) => updateNodeData(id, { fontFamily: e.target.value })}>
        {fontGroups.map(g => <optgroup key={g.label} label={g.label}>{g.fonts.map(f => <option key={f} value={f}>{f}</option>)}</optgroup>)}
      </select>
      <div className={cn('h-4 w-[1px] mx-1', theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')} />
      <button onClick={() => updateNodeData(id, { fontSize: Math.max(12, (data.fontSize || 20) - 2) })} className={cn('p-1 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-200 text-slate-600')}><LucideIcons.Minus size={12} /></button>
      <span className={cn('text-[10px] font-mono min-w-4 text-center', theme === 'dark' ? 'text-white' : 'text-slate-900')}>{data.fontSize || 20}</span>
      <button onClick={() => updateNodeData(id, { fontSize: Math.min(120, (data.fontSize || 20) + 2) })} className={cn('p-1 rounded transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-200 text-slate-600')}><LucideIcons.Plus size={12} /></button>
      <div className={cn('h-4 w-[1px] mx-1', theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')} />
      {(['left', 'center', 'right'] as const).map(align => (
        <button key={align} onClick={() => updateNodeData(id, { textAlign: align })} className={cn('p-1 rounded transition-colors', (data.textAlign || 'left') === align ? 'text-accent bg-accent/10' : theme === 'dark' ? 'text-white' : 'text-slate-400')}>
          {align === 'left' ? <LucideIcons.AlignLeft size={12} /> : align === 'center' ? <LucideIcons.AlignCenter size={12} /> : <LucideIcons.AlignRight size={12} />}
        </button>
      ))}
      <div className={cn('h-4 w-[1px] mx-1', theme === 'dark' ? 'bg-white/10' : 'bg-slate-200')} />
      <button className={cn('p-1 rounded text-[10px] font-bold px-2 transition-colors', theme === 'dark' ? 'hover:bg-white/10 text-white/50' : 'hover:bg-slate-200 text-slate-500')} onClick={() => alert('Use keyboard shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline)')}>Shortcuts Info</button>
    </div>
  );
};

// ─── CustomEdge — SmoothStep routing + connection highlighting ─────────────────

export const CustomEdge = memo(({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style = {},
  markerEnd, markerStart,
  selected,
  source, target,
}: any) => {
  const { deleteEdge, toggleEdgeBidirectional } = useStore();
  const theme          = useStore((s) => s.theme);
  const selectedNodeId = useStore((s) => s.selectedNodeId);

  const isHighlighted = !!selectedNodeId && (source === selectedNodeId || target === selectedNodeId);
  const isDimmed       = !!selectedNodeId && !isHighlighted && !selected;

  // Bezier routing — reliable across all ReactFlow 11 versions
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  });

  const edgeColor = isHighlighted
    ? '#38bdf8'
    : theme === 'dark' ? '#64748b' : '#94a3b8';

  const edgeStyle = {
    ...style,
    stroke: edgeColor,
    strokeWidth: isHighlighted ? 2.5 : selected ? 2 : 1.5,
    opacity: isDimmed ? 0.12 : 1,
    filter: isHighlighted ? `drop-shadow(0 0 5px ${edgeColor}70)` : undefined,
    transition: 'stroke 0.2s, opacity 0.2s, stroke-width 0.15s',
  };

  const computedMarkerEnd   = markerEnd   ? { ...markerEnd,   color: isHighlighted ? '#38bdf8' : markerEnd.color }   : markerEnd;
  const computedMarkerStart = markerStart ? { ...markerStart, color: isHighlighted ? '#38bdf8' : markerStart.color } : markerStart;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={computedMarkerEnd} markerStart={computedMarkerStart} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }} className="nodrag nopan">
          {selected && (
            <div className="flex items-center gap-1 p-1 rounded-full bg-sidebar border border-border shadow-xl">
              <button className={cn('w-6 h-6 rounded-full flex items-center justify-center transition-all bg-accent text-bg hover:scale-110', markerStart ? 'ring-2 ring-accent ring-offset-2' : 'opacity-50')} title="Toggle 2-way Arrows" onClick={(e) => { e.stopPropagation(); toggleEdgeBidirectional(id); }}>
                <LucideIcons.ArrowLeftRight size={12} />
              </button>
              <button className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500 text-white hover:scale-110" title="Delete Connection" onClick={(e) => { e.stopPropagation(); deleteEdge(id); }}>
                <LucideIcons.X size={12} />
              </button>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

// ─── Display names ─────────────────────────────────────────────────────────────

MarketingNode.displayName   = 'MarketingNode';
LandingPageNode.displayName = 'LandingPageNode';
StickyNoteNode.displayName  = 'StickyNoteNode';
FreeTextNode.displayName    = 'FreeTextNode';
TitleNode.displayName       = 'TitleNode';
ImageNode.displayName       = 'ImageNode';
ShapeNode.displayName       = 'ShapeNode';
GroupNode.displayName       = 'GroupNode';
CustomEdge.displayName      = 'CustomEdge';
