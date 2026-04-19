import { Node, Edge } from 'reactflow';

export type NodeType = 'discovery' | 'direct' | 'owned' | 'physical' | 'sticky' | 'text' | 'title' | 'image' | 'preset' | 'shape' | 'group';

export type ChannelIconType = 'whatsapp' | 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'wechat' | 'outdoor' | 'email' | 'google-ads' | 'form' | 'others';

export type ShapeType = 'square' | 'circle' | 'line' | 'dotted-line';

export interface SocialChannel {
  id: string;
  type: ChannelIconType;
  label: string;
  note?: string;
}

export interface NodeData {
  label: string;
  type: NodeType;
  icon?: string;
  volume: number;
  ctr: number;
  cpc: number;
  physicalDropoff?: number;
  mockupModules?: MockupModule[];
  channels?: SocialChannel[];
  primaryChannel?: ChannelIconType;
  note?: string;
  expanded?: boolean;
  pageType?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily2?: string;
  label2?: string;
  width?: number;
  height?: number;
  titleType?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  imageUrl?: string;
  shapeType?: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textColor?: string;
  rotation?: number;
  customIcon?: string;
}

export interface MarketingPreset {
  id: string;
  name: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export interface MockupModule {
  id: string;
  type: 'Hero' | 'Map' | 'QR' | 'Chatbot' | 'Redemption' | 'CTA' | 'Form' | 'Subscription' | 'CustomPage' | 'Video' | 'Testimonials' | 'FAQ' | 'Features' | 'Pricing';
  label?: string;
  content: any;
}

export interface AppState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  history: { nodes: Node<NodeData>[]; edges: Edge[] }[];
  historyIndex: number;
  showNumbers: boolean;
  theme: 'dark' | 'light';
  interactionMode: 'select' | 'pan';
  isConnecting: boolean;
  
  // Actions
  setIsConnecting: (val: boolean) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  toggleNumbers: () => void;
  arrangeGrid: (mode?: 'grid' | 'horizontal' | 'vertical' | 'circular') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setInteractionMode: (mode: 'select' | 'pan') => void;
  importCampaign: (data: { nodes: any[]; edges: any[] }) => void;
  deleteEdge: (edgeId: string) => void;
  deleteSelection: () => void;
  toggleEdgeBidirectional: (edgeId: string) => void;
  
  // Mockup Actions
  addMockupModule: (nodeId: string, module: MockupModule) => void;
  updateMockupModules: (nodeId: string, modules: MockupModule[]) => void;
  reorderMockupModule: (nodeId: string, moduleId: string, direction: 'up' | 'down') => void;
  renameMockupModule: (nodeId: string, moduleId: string, label: string) => void;
  
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Layering
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // Grouping
  createGroup: (nodeIds: string[]) => void;
  ungroup: (groupId: string) => void;

  // Presets
  presets: MarketingPreset[];
  saveCurrentAsPreset: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;

  // Clipboard
  clipboard: { nodes: Node<NodeData>[]; edges: Edge[] } | null;
  copySelection: () => void;
  pasteSelection: () => void;
  duplicateSelection: () => void;
  selectAll: () => void;
  clearSelection: () => void;
}
