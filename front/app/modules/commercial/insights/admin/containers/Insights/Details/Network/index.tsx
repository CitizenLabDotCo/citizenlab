import { withRouter, WithRouterProps } from 'react-router';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';

// graph
import { forceCollide } from 'd3-force';
import ForceGraph2D, {
  ForceGraphMethods,
  NodeObject,
} from 'react-force-graph-2d';

// hooks
import useInsightsView from 'modules/commercial/insights/hooks/useInsightsView';
import useNetwork from 'modules/commercial/insights/hooks/useInsightsNetwork';

// types
import { IInsightsNetworkNode } from 'modules/commercial/insights/services/insightsNetwork';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { cloneDeep } from 'lodash-es';
import { colors } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';
import { saveAs } from 'file-saver';

// components
import { Box } from 'cl2-component-library';
import Button from 'components/UI/Button';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

type CanvasCustomRenderMode = 'replace' | 'before' | 'after';
type Node = NodeObject & IInsightsNetworkNode;

const zoomStep = 0.2;
const chargeStrength = -25;
const chargeDistanceMax = 80;
const linkDistance = 40;

const nodeColors = [
  colors.clGreen,
  colors.clBlue,
  colors.clRed,
  colors.adminOrangeIcons,
  colors.adminTextColor,
  colors.facebookMessenger,
  colors.facebook,
  colors.label,
  '#0DA796',
  '#934E6F',
];

const Network = ({
  params: { viewId },
  intl: { formatMessage, formatDate },
  location: { query, pathname },
}: WithRouterProps & InjectedIntlProps) => {
  const [initialRender, setInitialRender] = useState(true);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);

  const [collapsedClusters, setCollapsedClusters] = useState<string[]>([]);
  const networkRef = useRef<ForceGraphMethods>();
  const network = useNetwork(viewId);
  const view = useInsightsView(viewId);

  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.d3Force('charge')?.strength(chargeStrength);
      networkRef.current.d3Force('link')?.distance(linkDistance);
      networkRef.current.d3Force('charge')?.distanceMax(chargeDistanceMax);
      networkRef.current.d3Force(
        'collide',
        forceCollide().radius((node: IInsightsNetworkNode) => {
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
    setInitialRender(true);
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

  if (isNilOrError(network) || isNilOrError(view)) {
    return null;
  }

  const handleEngineStop = () => {
    if (initialRender && networkRef.current) {
      networkRef.current.zoomToFit();
    }
    setInitialRender(false);
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

  const toggleCluster = (node: Node) => {
    if (collapsedClusters.includes(node.id)) {
      setCollapsedClusters(collapsedClusters.filter((id) => id !== node.id));
      networkRef.current?.zoom(2, 400);
      networkRef.current?.centerAt(node.x, node.y, 400);
    } else {
      setCollapsedClusters([...collapsedClusters, node.id]);
    }
  };

  const handleNodeClick = (node: Node) => {
    const isClusterNode = node.cluster_id === null;
    if (isClusterNode) {
      toggleCluster(node);
      trackEventByName(tracks.clickOnCluster, { clusterName: node.name });
    } else {
      clHistory.replace({
        pathname,
        search: stringify(
          // Only add unique keywords to url query
          {
            ...query,
            keywords: query.keywords
              ? !query.keywords.includes(node.id)
                ? [query.keywords, node.id]
                : query.keywords
              : node.id,
          },
          { addQueryPrefix: true, indices: false }
        ),
      });
      trackEventByName(tracks.clickOnKeyword, { keywordName: node.name });
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

  const onZoomEnd = ({ k }: { k: number }) => {
    if (!initialRender) {
      if (zoomLevel !== k) {
        setZoomLevel(k);
        trackEventByName(tracks.zoomVisualization);
      } else {
        trackEventByName(tracks.panVisualization);
      }
    }
  };

  const onZoomIn = () => {
    networkRef.current?.zoom(zoomLevel + zoomStep);
  };

  const onZoomOut = () => {
    zoomLevel - zoomStep > zoomStep
      ? networkRef.current?.zoom(zoomLevel - zoomStep)
      : networkRef.current?.zoom(zoomStep);
  };

  const nodeColor = (node: Node) =>
    nodeColors[node.color_index % nodeColors.length];

  const exportNetwork = () => {
    const srcCanvas = document.getElementsByTagName('canvas')[0];
    const destinationCanvas = document.createElement('canvas');
    destinationCanvas.width = width * 2;
    destinationCanvas.height = height * 2;

    const destinationCanvasCtx = destinationCanvas.getContext('2d');

    // Creates a destination canvas with white background
    // and draws the original canvas on it to ensure the
    // exported image has white background
    if (destinationCanvasCtx) {
      destinationCanvasCtx.fillStyle = '#FFF';
      destinationCanvasCtx.fillRect(0, 0, srcCanvas.width, srcCanvas.height);
      destinationCanvasCtx.drawImage(srcCanvas, 0, 0);
    }

    destinationCanvas.toBlob((blob: Blob) => {
      saveAs(
        blob,
        `${formatMessage(messages.network)}_${
          view.attributes.name
        }_${formatDate(Date.now())}.png`
      );
    });
  };

  return (
    <Box ref={containerRef} h="100%" position="relative">
      {height && width && (
        <ForceGraph2D
          height={height}
          width={width}
          cooldownTicks={50}
          nodeRelSize={2}
          ref={networkRef}
          onNodeClick={handleNodeClick}
          graphData={networkAttributes}
          onEngineStop={handleEngineStop}
          nodeCanvasObjectMode={nodeCanvasObjectMode}
          nodeCanvasObject={nodeCanvasObject}
          enableNodeDrag={false}
          nodeVisibility={nodeVisibility}
          linkVisibility={linkVisibility}
          onZoomEnd={onZoomEnd}
          nodeColor={nodeColor}
        />
      )}
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
      <Button
        position="absolute"
        left="8px"
        bottom="8px"
        buttonStyle="text"
        onClick={exportNetwork}
      >
        {formatMessage(messages.export)}
      </Button>
    </Box>
  );
};

export default withRouter(injectIntl(Network));
