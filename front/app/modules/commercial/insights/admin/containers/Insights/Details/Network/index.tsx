import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

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
import { saveAs } from 'file-saver';
import {
  drawHideIcon,
  drawHideIconClickBox,
  drawHideIconArea,
  drawBubbleArea,
  drawLabelArea,
  drawAreaInBetween,
} from 'modules/commercial/insights/utils/canvasShapes';

// components
import { Box, Spinner, IconTooltip } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import {
  TooltipContent,
  SectionTitle,
} from 'modules/commercial/insights/admin/components/StyledTextComponents';
import ShowHiddenNodes from 'modules/commercial/insights/admin/components/ShowHiddenNodes';

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
export interface IInsightsNetworkNodeMeta extends IInsightsNetworkNode {
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
  intl: { formatMessage, formatDate },
}: InjectedIntlProps) => {
  const [initialRender, setInitialRender] = useState(true);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [hoverNode, setHoverNode] = useState<Node | undefined>();
  const [pointerPosition, setPointerPosition] = useState([0, 0]);
  const [graphInitialized, setGraphInitialized] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { viewId } = useParams();

  const networkRef = useRef<ForceGraphMethods>();
  const { loading, network } = useNetwork(viewId);
  const view = useInsightsView(viewId);
  const tooltipRef = document.getElementsByClassName('graph-tooltip')[0];

  const setPointerEvent = (e) => setPointerPosition([e.offsetX, e.offsetY]);
  const appendSearchParams = (params) =>
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      ...params,
    });

  useEffect(() => {
    if (graphInitialized) {
      const canvasElement = document.getElementsByTagName('canvas')[0];
      canvasElement.addEventListener('pointermove', setPointerEvent);
      return () =>
        canvasElement &&
        canvasElement.removeEventListener('pointermove', setPointerEvent);
    } else {
      return;
    }
  }, [graphInitialized]);

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
          drawHideIcon(ctx, node);

          const [offsetX, offsetY] = pointerPosition;
          const rect = drawHideIconClickBox(node);

          if (ctx.isPointInPath(rect, offsetX, offsetY)) {
            tooltipRef.textContent = formatMessage(messages.networkHideNode);
          } else {
            tooltipRef.textContent = label;
          }
        }
      }
    }
  };

  const getURLArrayParam = (key: string) => {
    const value = searchParams.getAll(key);
    return typeof value === 'string' ? [value] : value ? value : [];
  };

  const getKeywords = ({ id }: Node, isHiding: boolean) => {
    let keywords = getURLArrayParam('keywords');

    if (keywords.includes(id)) {
      keywords = keywords.filter((keyword: string) => keyword !== id);
    } else if (!isHiding) {
      keywords.push(id);
    }
    return keywords;
  };

  const handleNodeClick = (node: Node, event) => {
    let isHiding = false;
    const hidden_keywords = getURLArrayParam('hidden_keywords');
    if (node.x && node.y) {
      const { target, offsetX, offsetY } = event;
      const ctx = target.getContext('2d');
      const rect = drawHideIconClickBox(node);

      if (ctx.isPointInPath(rect, offsetX, offsetY)) {
        hidden_keywords.push(node.id);
        isHiding = true;
      }
    }

    const keywords = getKeywords(node, isHiding);
    appendSearchParams({ keywords, hidden_keywords });

    trackEventByName(tracks.clickOnKeyword, { keywordName: node.name });
  };

  const handleShowHiddenNodesClick = () => {
    const { hidden_keywords, ...params } = Object.fromEntries(
      searchParams.entries()
    );

    setSearchParams(params);
  };

  const nodePointerAreaPaint = (node, color, ctx) => {
    ctx.fillStyle = color;

    drawHideIconArea(ctx, node);
    drawBubbleArea(ctx, node);
    drawLabelArea(ctx, node);
    drawAreaInBetween(ctx, node);
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

  const nodeVisibility = ({ id }: Node) =>
    !getURLArrayParam('hidden_keywords').includes(id);
  const linkVisibility = ({ source, target }) => {
    return getURLArrayParam('hidden_keywords').every(
      (nodeId) => ![source.id, target.id].includes(nodeId)
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

  const onEngineTick = () => !graphInitialized && setGraphInitialized(true);

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
        <ShowHiddenNodes
          hiddenNodes={getURLArrayParam('hidden_keywords')}
          nodesNames={
            !isNilOrError(network) &&
            network.data.attributes.nodes.map(({ id, name }) => ({ id, name }))
          }
          handleShowHiddenNodesClick={handleShowHiddenNodesClick}
        />
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
          onEngineTick={onEngineTick}
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

export default injectIntl(Network);
