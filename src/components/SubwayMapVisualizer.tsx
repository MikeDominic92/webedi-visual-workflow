// src/components/SubwayMapVisualizer.tsx

import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
  NodeProps,
  getBezierPath,
  EdgeProps,
} from 'reactflow';
import { motion } from 'framer-motion';
import 'reactflow/dist/style.css';

const StealthNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const statusColors = {
    start: 'from-emerald-400 to-emerald-600 border-emerald-400 shadow-emerald-500/50',
    processing: 'from-amber-400 to-amber-600 border-amber-400 shadow-amber-500/50 animate-pulse',
    error: 'from-red-400 to-red-600 border-red-400 shadow-red-500/50',
    complete: 'from-gray-400 to-gray-600 border-gray-400 shadow-gray-500/50',
  };

  const pulseAnimation = data.status === 'processing' ? {
    scale: [1, 1.1, 1],
    transition: { duration: 2, repeat: Infinity }
  } : {};

  return (
    <motion.div
      animate={pulseAnimation}
      className="relative"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-stealth-400"
      />
      
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center
        bg-gradient-to-br ${statusColors[data.status as keyof typeof statusColors]}
        border-2 shadow-lg shadow-current cursor-pointer
        transition-all duration-300 hover:scale-110
        relative overflow-hidden
      `}>
        {data.status === 'processing' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}
        <div className="text-white font-bold text-sm text-center relative z-10">
          {data.status === 'error' ? '⚠' : data.status === 'processing' ? '⟳' : '✓'}
        </div>
      </div>
      
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center w-48">
        <div className="glass-effect px-4 py-2 rounded-lg shadow-stealth-lg border border-stealth-600/50">
          <p className="text-sm font-semibold text-white">
            {data.label}
          </p>
          {data.description && (
            <p className="text-xs text-stealth-200 mt-1">
              {data.description}
            </p>
          )}
          {data.errorDetails && (
            <p className="text-xs text-status-error mt-2 break-words">
              {data.errorDetails.length > 50 
                ? data.errorDetails.substring(0, 50) + '...' 
                : data.errorDetails}
            </p>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-stealth-400"
      />
    </motion.div>
  );
};

const SubwayEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const edgeColor = data?.type === 'error' ? '#f87171' : '#525252';

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={4}
        stroke={edgeColor}
        fill="none"
        strokeDasharray={data?.animated ? "5 5" : "0"}
      >
        {data?.animated && (
          <animate
            attributeName="stroke-dashoffset"
            values="10;0"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </path>
    </>
  );
};

const nodeTypes = {
  station: StealthNode,
};

const edgeTypes = {
  main: SubwayEdge,
  error: SubwayEdge,
  alternative: SubwayEdge,
};

interface SubwayMapVisualizerProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
}

const SubwayMapVisualizer: React.FC<SubwayMapVisualizerProps> = ({
  nodes,
  edges,
  onNodeClick,
}) => {
  const onNodeClickHandler = useCallback((event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  const defaultEdgeOptions = {
    type: 'main',
    animated: false,
  };

  return (
    <div className="w-full h-full bg-stealth-900 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClickHandler}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
      >
        <Background 
          color="#1a1a1a" 
          gap={30} 
          size={1}
          style={{ backgroundColor: '#000000' }}
          className="grid-background"
        />
        <Controls 
          className="glass-effect rounded-lg border border-stealth-600/50 shadow-stealth-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={(node) => {
            const colors = {
              start: '#10b981',
              processing: '#f59e0b',
              error: '#ef4444',
              complete: '#71717a',
            };
            return colors[node.data?.status as keyof typeof colors] || '#71717a';
          }}
          className="glass-effect rounded-lg border border-stealth-600/50 shadow-stealth-lg"
          maskColor="rgba(0, 0, 0, 0.9)"
        />
      </ReactFlow>
      
      <div className="absolute top-4 right-4 glass-effect p-3 rounded-lg border border-stealth-600/50 shadow-stealth-lg">
        <h3 className="text-xs font-semibold text-stealth-200 mb-2 uppercase tracking-wider">Legend</h3>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-stealth-100">Start/Success</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-xs text-stealth-100">Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-stealth-100">Error</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-stealth-100">Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubwayMapVisualizer;