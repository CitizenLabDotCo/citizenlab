import React, { useEffect, useRef, useState, useMemo } from 'react';
import useNetwork from 'modules/commercial/insights/hooks/useInsightsNetwork';
import { IInsightsNetworkData } from 'modules/commercial/insights/services/insightsNetwork';
import { withRouter, WithRouterProps } from 'react-router';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { isNilOrError } from 'utils/helperUtils';
import * as d3 from 'd3';

const Network = ({ params: { viewId } }: WithRouterProps) => {
  const [initialCenter, setInitialCenter] = useState(true);
  const forceRef = useRef<ForceGraphMethods>();
  const network = useNetwork(viewId);

  useEffect(() => {
    if (forceRef.current) {
      forceRef.current.d3Force('charge')?.strength(-5);
      forceRef.current.d3Force('link')?.distance(20);
      forceRef.current.d3Force('charge')?.distanceMax(60);
      forceRef.current.d3Force(
        'collide',
        d3.forceCollide().radius((node) => {
          return node.cluster_id === null ? node.val / 7 : node.val;
        })
      );
    }
  });

  if (isNilOrError(network)) {
    return null;
  }

  const networkAttributes = JSON.parse(JSON.stringify(network.attributes));

  const handleEngineStop = () => {
    if (initialCenter && forceRef.current) {
      forceRef.current.zoomToFit();
    }
    setInitialCenter(false);
  };

  return (
    <div>
      <ForceGraph2D
        // width={window.innerWidth / 2}
        height={550}
        ref={forceRef}
        //  onNodeClick={handleNodeClick}
        graphData={networkAttributes}
        cooldownTicks={50}
        nodeRelSize={1}
        onEngineStop={handleEngineStop}
        // nodeCanvasObjectMode={() => 'after'}
        // nodeCanvasObject={(node, ctx, globalScale) => {
        //   const label = node.name;
        //   const fontSize = node.isClusterNode
        //     ? 14 * (node.val / 950)
        //     : 14 / (globalScale * 1.2);
        //   ctx.font = `${fontSize}px Sans-Serif`;
        //   ctx.textAlign = 'center';
        //   ctx.textBaseline = 'middle';
        //   ctx.fillStyle = node.isClusterNode ? 'white' : 'black'; //node.color;
        //   if (node.isClusterNode) {
        //     const lineHeight = fontSize * 1.2;
        //     const lines = label.split(',');
        //     let x = node.x;
        //     let y = node.y - lineHeight;
        //     for (let i = 0; i < lines.length; ++i) {
        //       ctx.fillText(lines[i], x, y);
        //       y += lineHeight;
        //     }
        //   } else if (globalScale >= 4.5) {
        //     ctx.fillText(label, node.x, node.y + 2.5);
        //   }
        // }}
        enableNodeDrag={false}
        // nodeVisibility={(node) => {
        //   if (collapsedClusters.includes(node.clusterId)) {
        //     return false;
        //   } else return true;
        // }}
        // linkVisibility={(link) => {
        //   if (
        //     collapsedClusters.includes(link.source.id) &&
        //     !link.target.isClusterNode
        //   ) {
        //     return false;
        //   } else if (
        //     hiddenClusters.includes(link.source.id) ||
        //     hiddenClusters.includes(link.target.id)
        //   ) {
        //     return false;
        //   } else return true;
        // }}
      />
    </div>
  );
};

export default withRouter(Network);
