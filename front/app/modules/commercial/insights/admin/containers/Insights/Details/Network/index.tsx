import { withRouter, WithRouterProps } from 'react-router';
import React, { useEffect, useRef, useState, useMemo } from 'react';

// graph
import * as d3 from 'd3';
import ForceGraph2D, {
  ForceGraphMethods,
  NodeObject,
} from 'react-force-graph-2d';
// hooks
import useNetwork from 'modules/commercial/insights/hooks/useInsightsNetwork';

// types
import { IInsightsNetworkNode } from 'modules/commercial/insights/services/insightsNetwork';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { cloneDeep } from 'lodash-es';

type CanvasCustomRenderMode = 'replace' | 'before' | 'after';
type Node = NodeObject & IInsightsNetworkNode;

const Network = ({ params: { viewId } }: WithRouterProps) => {
  const [initialCenter, setInitialCenter] = useState(true);
  const [collapsedClusters, setCollapsedClusters] = useState<string[]>([]);
  const forceRef = useRef<ForceGraphMethods>();
  const network = useNetwork(viewId);

  useEffect(() => {
    if (forceRef.current) {
      forceRef.current.d3Force('charge')?.strength(-10);
      forceRef.current.d3Force('link')?.distance(10);
      forceRef.current.d3Force('charge')?.distanceMax(60);
      forceRef.current.d3Force(
        'collide',
        // @ts-ignore
        d3.forceCollide().radius((node: IInsightsNetworkNode) => {
          const isClusterNode = node.cluster_id === null;
          return isClusterNode ? node.val / 5 : node.val * 3 + 5;
        })
      );
    }
  });

  const clusterIds = useMemo(() => {
    if (!isNilOrError(network)) {
      return network.attributes.nodes
        .filter((node) => node.cluster_id === null)
        .map((node) => node.id);
    } else return [];
  }, [network]);

  useEffect(() => {
    setCollapsedClusters(clusterIds);
    setInitialCenter(true);
  }, [clusterIds]);

  const networkAttributes = useMemo(() => {
    if (!isNilOrError(network)) {
      return cloneDeep(network.attributes);
    } else return { nodes: [], links: [] };
  }, [network]);

  if (isNilOrError(network)) {
    return null;
  }

  const handleEngineStop = () => {
    if (initialCenter && forceRef.current) {
      forceRef.current.zoomToFit();
    }
    setInitialCenter(false);
  };

  const nodeCanvasObjectMode = () => 'after' as CanvasCustomRenderMode;

  const nodeCanvasObject = (
    node: Node,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    if (node.x && node.y) {
      const isClusterNode = node.cluster_id === null;
      const label = node.name;
      const fontSize = isClusterNode
        ? 14 * (node.val / 950)
        : 11 / (globalScale * 1.2);
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isClusterNode ? '#fff' : '#000';

      if (isClusterNode) {
        const lineHeight = fontSize * 1.2;
        const lines = label.split(',');
        const x = node.x;
        let y = node.y - lineHeight;
        for (let i = 0; i < lines.length; i = i + 1) {
          ctx.fillText(lines[i], x, y);
          y += lineHeight;
        }
      } else if (globalScale >= 4) {
        ctx.fillText(label, node.x, node.y - 2);
      }
    }
  };

  const nodeVisibility = (node: Node) => {
    if (node.cluster_id && collapsedClusters.includes(node.cluster_id)) {
      return false;
    } else return true;
  };

  const toggleClusterCollapse = (clusterId: string) => {
    if (collapsedClusters.includes(clusterId)) {
      setCollapsedClusters(collapsedClusters.filter((id) => id !== clusterId));
    } else {
      setCollapsedClusters([...collapsedClusters, clusterId]);
    }
  };

  const handleNodeClick = (node: Node) => {
    toggleClusterCollapse(node.id);
    if (collapsedClusters.includes(node.id)) {
      forceRef.current?.zoom(4, 400);
      forceRef.current?.centerAt(node.x, node.y, 400);
    }
  };

  const linkVisibility = (link: { source: Node; target: Node }) => {
    if (
      collapsedClusters.includes(link.source?.id) &&
      link.target.cluster_id !== null
    ) {
      return false;
    } else return true;
  };

  return (
    <div>
      <ForceGraph2D
        height={550}
        cooldownTicks={50}
        nodeRelSize={1}
        ref={forceRef}
        onNodeClick={handleNodeClick}
        graphData={networkAttributes}
        onEngineStop={handleEngineStop}
        nodeCanvasObjectMode={nodeCanvasObjectMode}
        nodeCanvasObject={nodeCanvasObject}
        enableNodeDrag={false}
        nodeVisibility={nodeVisibility}
        linkVisibility={linkVisibility}
      />
    </div>
  );
};

export default withRouter(Network);
