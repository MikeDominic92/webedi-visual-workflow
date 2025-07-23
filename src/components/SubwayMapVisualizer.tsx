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

const StationNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const statusColors = {
    start: 'bg-emerald-500 border-emerald-400',
    processing: 'bg-amber-500 border-amber-400',
    error: 'bg-red-500 border-red-400',
    complete: 'bg-zinc-500 border-zinc-400',
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
        className="w-3 h-3 !bg-zinc-400"
      />
      
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center
        ${statusColors[data.status as keyof typeof statusColors]}
        border-4 shadow-2xl cursor-pointer
        transition-all duration-300 hover:scale-110
      `}>
        <div className="text-black font-bold text-xs text-center">
          {data.status === 'error' ? '!' : '✓'}
        </div>
      </div>
      
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center w-48">
        <div className="bg-zinc-900 px-4 py-2 rounded-lg shadow-xl border border-zinc-700">
          <p className="text-sm font-semibold text-white">
            {data.label}
          </p>
          {data.description && (
            <p className="text-xs text-zinc-400 mt-1">
              {data.description}
            </p>
          )}
          {data.errorDetails && (
            <p className="text-xs text-red-400 mt-2 break-words">
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
        className="w-3 h-3 !bg-zinc-400"
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

  const edgeColor = data?.type === 'error' ? '#ef4444' : '#71717a';

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
  station: StationNode,
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
    <div className="w-full h-full bg-black rounded-lg">
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
          color="#27272a" 
          gap={20} 
          size={1}
          style={{ backgroundColor: '#000000' }}
        />
        <Controls 
          className="bg-zinc-900 rounded-lg border border-zinc-700"
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
          className="bg-zinc-900 rounded-lg border border-zinc-700"
          maskColor="rgb(0, 0, 0, 0.8)"
        />
      </ReactFlow>
      
      <div className="absolute top-4 right-4 bg-zinc-900/95 backdrop-blur p-3 rounded-lg border border-zinc-700">
        <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Legend</h3>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-zinc-300">Start/Success</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-xs text-zinc-300">Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-zinc-300">Error</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-zinc-500 rounded-full"></div>
            <span className="text-xs text-zinc-300">Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubwayMapVisualizer;