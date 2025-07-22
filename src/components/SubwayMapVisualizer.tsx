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
    start: 'bg-green-500 border-green-600',
    processing: 'bg-yellow-500 border-yellow-600',
    error: 'bg-red-500 border-red-600',
    complete: 'bg-blue-500 border-blue-600',
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
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-gray-700"
      />
      
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center
        ${statusColors[data.status as keyof typeof statusColors]}
        border-4 shadow-lg cursor-pointer
        transition-all duration-300 hover:scale-110
      `}>
        <div className="text-white font-bold text-xs text-center">
          {data.status === 'error' ? '!' : '✓'}
        </div>
      </div>
      
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-white px-3 py-1 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
            {data.label}
          </p>
          {data.errorDetails && (
            <p className="text-xs text-red-600 mt-1 max-w-xs">
              {data.errorDetails}
            </p>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-gray-700"
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

  const edgeColor = data?.type === 'error' ? '#ef4444' : '#1f2937';

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
    <div className="w-full h-full bg-gray-50 rounded-lg shadow-inner">
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
          color="#e5e7eb" 
          gap={20} 
          size={1}
          style={{ backgroundColor: '#f9fafb' }}
        />
        <Controls 
          className="bg-white rounded-lg shadow-md"
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
              complete: '#3b82f6',
            };
            return colors[node.data?.status as keyof typeof colors] || '#6b7280';
          }}
          className="bg-white rounded-lg shadow-md"
          maskColor="rgb(50, 50, 50, 0.1)"
        />
      </ReactFlow>
      
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Status Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Start/Success</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Error</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubwayMapVisualizer;