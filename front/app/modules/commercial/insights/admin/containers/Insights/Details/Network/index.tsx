import { withRouter, WithRouterProps } from 'react-router';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';

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
import { colors } from 'utils/styleUtils';

// components
import { Box } from 'cl2-component-library';
import Button from 'components/UI/Button';

type CanvasCustomRenderMode = 'replace' | 'before' | 'after';
type Node = NodeObject & IInsightsNetworkNode;

const zoomStep = 0.2;
const chargeStrength = -25;
const chargeDistanceMax = 80;
const linkDistance = 40;

const Network = ({ params: { viewId } }: WithRouterProps) => {
  const [initialCenter, setInitialCenter] = useState(true);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);

  const [collapsedClusters, setCollapsedClusters] = useState<string[]>([]);
  const forceRef = useRef<ForceGraphMethods>();
  const network = useNetwork(viewId);

  useEffect(() => {
    if (forceRef.current) {
      forceRef.current.d3Force('charge')?.strength(chargeStrength);
      forceRef.current.d3Force('link')?.distance(linkDistance);
      forceRef.current.d3Force('charge')?.distanceMax(chargeDistanceMax);
      forceRef.current.d3Force(
        'collide',
        // @ts-ignore
        d3.forceCollide().radius((node: IInsightsNetworkNode) => {
          const isClusterNode = node.cluster_id === null;
          // This value determines the collision force. For clusters, it depends on the cluster size only.
          // For keywords, it includes a constant in order to give more weight to small key words and avoid overlap
          return isClusterNode ? node.val / 4 : node.val * 3 + 8;
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

  const containerRef = useCallback((node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

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
        ? 14 * (node.val / 500)
        : 12 / (globalScale * 1.2);
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
      } else if (globalScale >= 2) {
        ctx.fillText(label, node.x, node.y - node.val - 3);
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
      forceRef.current?.zoom(2, 400);
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

  const onZoomEnd = ({ k }: { k: number }) => setZoomLevel(k);

  const onZoomIn = () => {
    forceRef.current?.zoom(zoomLevel + zoomStep);
  };

  const onZoomOut = () => {
    zoomLevel - zoomStep > zoomStep
      ? forceRef.current?.zoom(zoomLevel - zoomStep)
      : forceRef.current?.zoom(zoomStep);
  };
  return (
    <Box ref={containerRef} h="100%" position="relative">
      <ForceGraph2D
        height={height}
        width={width}
        cooldownTicks={50}
        nodeRelSize={2}
        ref={forceRef}
        onNodeClick={handleNodeClick}
        graphData={networkAttributes}
        onEngineStop={handleEngineStop}
        nodeCanvasObjectMode={nodeCanvasObjectMode}
        nodeCanvasObject={nodeCanvasObject}
        enableNodeDrag={false}
        nodeVisibility={nodeVisibility}
        linkVisibility={linkVisibility}
        onZoomEnd={onZoomEnd}
      />
      <Box
        display="flex"
        flexDirection="column"
        minHeight="76px"
        justifyContent="space-between"
        position="absolute"
        bottom="8px"
        right="8px"
      >
        <Button
          buttonStyle="white"
          textColor={colors.adminTextColor}
          onClick={onZoomIn}
          width="36px"
          height="36px"
        >
          +
        </Button>
        <Button
          buttonStyle="white"
          textColor={colors.adminTextColor}
          onClick={onZoomOut}
          width="36px"
          height="36px"
        >
          -
        </Button>
      </Box>
    </Box>
  );
};

export default withRouter(Network);
