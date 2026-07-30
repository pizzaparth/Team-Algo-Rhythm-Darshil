import React from 'react';
import { getBezierPath, EdgeProps } from '@xyflow/react';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = (style as Record<string, any>)?.stroke || '#1A1A1A';

  return (
    <>
      {/* Background glow path */}
      <path
        id={`${id}-glow`}
        className="react-flow__edge-path-glow"
        d={edgePath}
        stroke={strokeColor}
        strokeWidth={4}
        strokeOpacity={0.2}
        fill="none"
      />
      {/* Main animated path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
        fill="none"
      />
    </>
  );
};
