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
type Node = NodeObject & IInsightsNetworkNode;

const zoomStep = 0.2;
const chargeStrength = -10;
const chargeDistanceMax = 5;
const linkDistance = 60;
const visibleKeywordLabelScale = 2;

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

  const networkRef = useRef<ForceGraphMethods>();
  const { loading, network } = useNetwork(viewId);
  const view = useInsightsView(viewId);

  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.d3Force('charge')?.strength(chargeStrength);
      networkRef.current.d3Force('link')?.distance((link) => {
        if (link.target.cluster_id === link.source.cluster_id) {
          return 20;
        }
        return linkDistance;
      });
      networkRef.current.d3Force('charge')?.distanceMax(chargeDistanceMax);
      networkRef.current.d3Force(
        'collide',
        forceCollide().radius(() => {
          return 10;
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

  const nodeCanvasObject = (
    node: Node,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    if (node.x && node.y) {
      const label = node.name;
      const fontSize = 14 / (globalScale * 1.2);
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = nodeColors[node.color_index % nodeColors.length];

      if (globalScale >= visibleKeywordLabelScale) {
        ctx.fillText(label, node.x, node.y - node.val / 3 - 2.5);
      }
    }
  };

  const handleNodeClick = (node: Node) => {
    const keywords =
      query.keywords && typeof query.keywords === 'string'
        ? [query.keywords]
        : query.keywords;

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
      </Box>
      {height && width && (
        <ForceGraph2D
          height={height}
          width={width}
          cooldownTicks={50}
          nodeRelSize={1}
          ref={networkRef}
          onNodeClick={handleNodeClick}
          graphData={networkAttributes}
          onEngineStop={handleEngineStop}
          nodeCanvasObjectMode={nodeCanvasObjectMode}
          nodeCanvasObject={nodeCanvasObject}
          onZoomEnd={onZoomEnd}
          nodeColor={nodeColor}
          enableNodeDrag={false}
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
