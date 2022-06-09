import { withRouter, WithRouterProps } from 'react-router';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
// graph
import ForceGraph2D, {
  ForceGraphMethods,
  NodeObject,
} from 'react-force-graph-2d';
import { forceCollide } from 'd3-force';

// hooks
import useInsightsView from 'modules/commercial/insights/hooks/useInsightsView';
import useNetwork from 'modules/commercial/insights/hooks/useInsightsNetwork';

// types
import { IInsightsNetworkNode } from 'modules/commercial/insights/services/insightsNetwork';

// utils
import { isNilOrError, isError } from 'utils/helperUtils';
import { cloneDeep } from 'lodash-es';
import { colors } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';
import { saveAs } from 'file-saver';

// components
import { Box, Spinner, IconTooltip } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import {
  TooltipContent,
  SectionTitle,
  TooltipContentList,
} from 'modules/commercial/insights/admin/components/StyledTextComponents';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
// styles
import styled from 'styled-components';

type CanvasCustomRenderMode = 'replace' | 'before' | 'after';
interface IInsightsNetworkNodeMeta extends IInsightsNetworkNode {
  nodeVerticalOffset: number;
  textWidth: number;
  globalScale: number;
  nodeFontSize: number;
}
type Node = NodeObject & IInsightsNetworkNodeMeta;

const zoomStep = 0.2;
const chargeStrength = -10;
const chargeDistanceMax = 5;
const linkDistanceForDifferentClusters = 60;
const linkDistanceForSameCluster = 20;
const visibleKeywordLabelScale = 2;
const collideForce = 10;

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

const StyledMessage = styled.h4`
  text-align: center;
`;

const Network = ({
  params: { viewId },
  intl: { formatMessage, formatDate },
  location: { query, pathname },
}: WithRouterProps & InjectedIntlProps) => {
  const [initialRender, setInitialRender] = useState(true);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [hoverNode, setHoverNode] = useState<Node | undefined>();
  const [pointerPosition, setPointerPosition] = useState([0, 0]);
  const [hiddenNodes, setHiddenNodes] = useState<Array<Node>>([]);

  const networkRef = useRef<ForceGraphMethods>();
  const { loading, network } = useNetwork(viewId);
  const view = useInsightsView(viewId);
  const tooltipRef = document.getElementsByClassName('graph-tooltip')[0];
  const canvasRef = useRef<HTMLCanvasElement | undefined>();

  useEffect(() => {
    if (canvasRef.current) return;
    canvasRef.current = document.getElementsByTagName('canvas')[0];
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const setPointerEvent = (e) => setPointerPosition([e.offsetX, e.offsetY]);
    canvasRef.current.addEventListener('pointermove', setPointerEvent);
    return () =>
      canvasRef.current &&
      canvasRef.current.removeEventListener('pointermove', setPointerEvent);
  }, [canvasRef.current]);

  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.d3Force('charge')?.strength(chargeStrength);
      networkRef.current.d3Force('link')?.distance((link) => {
        if (link.target.cluster_id === link.source.cluster_id) {
          return linkDistanceForSameCluster;
        }
        return linkDistanceForDifferentClusters;
      });
      networkRef.current.d3Force('charge')?.distanceMax(chargeDistanceMax);
      networkRef.current.d3Force(
        'collide',
        forceCollide().radius(() => {
          return collideForce;
        })
      );
    }
  });

  const networkAttributes = useMemo(() => {
    if (!isNilOrError(network)) {
      return cloneDeep(network.data.attributes);
    } else return { nodes: [], links: [] };
  }, [network]);

  const containerRef = useCallback((node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const handleEngineStop = () => {
    if (initialRender && networkRef.current) {
      networkRef.current.zoomToFit();
    }
    setInitialRender(false);
  };

  const nodeCanvasObjectMode = () => 'after' as CanvasCustomRenderMode;

  const handleNodeHover = (node: Node) => setHoverNode(node);

  const nodeCanvasObject = (
    node: Node,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    if (node.x && node.y) {
      const label = node.name;
      const nodeFontSize = 14 / (globalScale * 1.2);
      const nodeVerticalOffset = node.y - node.val / 3 - 2.5;
      ctx.font = `${nodeFontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = nodeColors[node.color_index % nodeColors.length];
      const textWidth = ctx.measureText(label).width;
      node.nodeVerticalOffset = nodeVerticalOffset;
      node.textWidth = textWidth;
      node.globalScale = globalScale;
      node.nodeFontSize = nodeFontSize;

      if (globalScale >= visibleKeywordLabelScale) {
        ctx.fillText(label, node.x, nodeVerticalOffset);

        if (node == hoverNode) {
          // Draw hide icon
          const hideIcon = new Path2D(
            'M7.84 6.5l4.89-4.84c.176-.174.274-.412.27-.66 0-.552-.447-1-1-1-.25.003-.488.107-.66.29L6.5 5.13 1.64.27C1.47.1 1.24.003 1 0 .448 0 0 .448 0 1c.01.23.105.45.27.61L5.16 6.5.27 11.34c-.177.173-.274.412-.27.66 0 .552.448 1 1 1 .246-.004.48-.105.65-.28L6.5 7.87l4.81 4.858c.183.184.433.28.69.27.553 0 1-.446 1-.998-.01-.23-.105-.45-.27-.61L7.84 6.5z'
          );
          const p = new Path2D();
          const transform = {
            a: 0.8 / globalScale,
            d: 0.8 / globalScale,
            e: node.x + textWidth / 2 + 5 / globalScale,
            f: nodeVerticalOffset - 6 / globalScale,
          };
          p.addPath(hideIcon, transform);
          ctx.fillStyle = colors.label;
          ctx.fill(p);

          // Change tooltip text on icon hover
          const [offsetX, offsetY] = pointerPosition;
          const rect = new Path2D();
          rect.rect(
            node.x + textWidth / 2 + 5 / globalScale,
            nodeVerticalOffset - 6 / globalScale,
            12 / globalScale,
            12 / globalScale
          );

          if (ctx.isPointInPath(rect, offsetX, offsetY)) {
            tooltipRef.textContent = formatMessage(messages.networkHideNode);
          } else {
            tooltipRef.textContent = label;
          }
        }
      }
    }
  };

  const handleNodeClick = (node: Node, event) => {
    let removedNode = false;
    if (node.x && node.y) {
      const ctx = event.target.getContext('2d');
      const globalScale = node.globalScale;
      const textWidth = node.textWidth;
      const nodeVerticalOffset = node.nodeVerticalOffset;

      const rect = new Path2D();
      rect.rect(
        node.x + textWidth / 2 + 5 / globalScale,
        nodeVerticalOffset - 6 / globalScale,
        12 / globalScale,
        12 / globalScale
      );
      ctx.fill(rect);

      if (ctx.isPointInPath(rect, event.offsetX, event.offsetY)) {
        setHiddenNodes([...hiddenNodes, node]);
        removedNode = true;
      }
    }

    const keywords =
      query.keywords && typeof query.keywords === 'string'
        ? [query.keywords]
        : query.keywords;

    if (!removedNode || (keywords && keywords.includes(node.id))) {
      clHistory.replace({
        pathname,
        search: stringify(
          // Toggle selected keywords in url
          {
            ...query,
            keywords: keywords
              ? !keywords.includes(node.id)
                ? [keywords, node.id]
                : keywords.filter((keyword: string) => keyword !== node.id)
              : node.id,
          },
          { addQueryPrefix: true, indices: false }
        ),
      });
      trackEventByName(tracks.clickOnKeyword, { keywordName: node.name });
    }
  };

  const handleShowHiddenNodesClick = () => setHiddenNodes([]);

  const nodePointerAreaPaint = (node, color, ctx) => {
    ctx.fillStyle = color;
    const globalScale = node.globalScale;
    const textWidth = node.textWidth;
    const nodeFontSize = node.nodeFontSize;
    const nodeVerticalOffset = node.nodeVerticalOffset;
    const val = Math.sqrt(Math.max(0, node.val || 1)) + 1 / globalScale;

    // bubble
    ctx.beginPath();
    ctx.arc(node.x, node.y, val, 0, 2 * Math.PI);
    ctx.fill();

    // hide icon
    ctx.fillRect(
      node.x + textWidth / 2 + 5 / globalScale,
      nodeVerticalOffset - 6 / globalScale,
      12 / globalScale,
      12 / globalScale
    );

    // label
    ctx.fillRect(
      node.x - textWidth / 2,
      nodeVerticalOffset - nodeFontSize + 6 / globalScale,
      textWidth,
      nodeFontSize
    );

    // area in between
    ctx.beginPath();
    ctx.moveTo(
      node.x - textWidth / 2,
      nodeVerticalOffset - nodeFontSize + 6 / globalScale
    );
    ctx.lineTo(
      node.x + textWidth / 2 + 20 / globalScale,
      nodeVerticalOffset - nodeFontSize + 6 / globalScale
    );
    ctx.lineTo(node.x + val / 2, node.y);
    ctx.lineTo(node.x - val / 2, node.y);
    ctx.closePath();
    ctx.fill();
  };

  const onZoomEnd = ({ k }: { k: number }) => {
    setZoomLevel(k);
    if (!initialRender) {
      if (zoomLevel !== k) {
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

  const nodeVisibility = (node: Node) => !hiddenNodes.includes(node);
  const linkVisibility = ({ source, target }) => {
    return hiddenNodes.every(
      (n: Node) => ![source.id, target.id].includes(n.id)
    );
  };

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
    if (!isNilOrError(view)) {
      destinationCanvas.toBlob((blob: Blob) => {
        saveAs(
          blob,
          `${formatMessage(messages.network)}_${
            view.data.attributes.name
          }_${formatDate(Date.now())}.png`
        );
      });
    }
  };

  if (loading) {
    return (
      <Box h="100%" display="flex" justifyContent="center" alignItems="center">
        <Spinner />
      </Box>
    );
  }

  if (isError(network)) {
    return (
      <Box
        w="50%"
        m="auto"
        h="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        color={colors.label}
      >
        <StyledMessage>
          <FormattedMessage
            {...messages.networkError}
            values={{
              link: (
                <a
                  href={formatMessage(messages.networkErrorLinkUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formatMessage(messages.networkErrorLink)}
                </a>
              ),
            }}
          />
        </StyledMessage>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} h="100%" position="relative" overflow="hidden">
      <Box mt="24px" ml="24px" position="absolute" zIndex="1000">
        <SectionTitle>
          {formatMessage(messages.networkTitle)}
          <IconTooltip
            ml="8px"
            content={
              <TooltipContent>
                <FormattedMessage
                  {...messages.networkTitleTooltip}
                  values={{
                    link: (
                      <a
                        href={formatMessage(
                          messages.networkTitleTooltipLinkUrl
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {formatMessage(messages.networkTitleTooltipLink)}
                      </a>
                    ),
                  }}
                />
              </TooltipContent>
            }
          />
        </SectionTitle>
        {hiddenNodes.length > 0 && (
          <Box
            mt="12px"
            style={{
              cursor: 'pointer',
              width: 'fit-content',
            }}
            onClick={handleShowHiddenNodesClick}
          >
            <IconTooltip
              mr="5px"
              icon="eye"
              placement="bottom"
              content={
                <TooltipContentList>
                  {(hiddenNodes.length > 10
                    ? [...hiddenNodes.slice(0, 9), '...']
                    : hiddenNodes
                  ).map((node: Node) => (
                    <li key={node.id}>{node.name}</li>
                  ))}
                </TooltipContentList>
              }
            />
            {formatMessage(messages.networkShowHiddenNodes) +
              ` (${hiddenNodes.length})`}
          </Box>
        )}
      </Box>
      {height && width && (
        <ForceGraph2D
          height={height}
          width={width}
          cooldownTicks={50}
          enableNodeDrag={false}
          ref={networkRef}
          graphData={networkAttributes}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onEngineStop={handleEngineStop}
          onZoomEnd={onZoomEnd}
          linkVisibility={linkVisibility}
          nodeVisibility={nodeVisibility}
          nodeRelSize={1}
          nodePointerAreaPaint={nodePointerAreaPaint}
          nodeCanvasObjectMode={nodeCanvasObjectMode}
          nodeCanvasObject={nodeCanvasObject}
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
