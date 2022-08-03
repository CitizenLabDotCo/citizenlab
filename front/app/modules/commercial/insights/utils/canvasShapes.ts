// utils
import { colors } from 'utils/styleUtils';

// typings
import { IInsightsNetworkNodeMeta } from 'modules/commercial/insights/admin/containers/Insights/Details/Network';
import { NodeObject } from 'react-force-graph-2d';

type Node = NodeObject & IInsightsNetworkNodeMeta;

function hideIconBoxParams(node: Node): [number, number, number, number] {
  const { globalScale, textWidth, nodeVerticalOffset, x } = node;
  if (x === undefined) return [0, 0, 0, 0];
  return [
    x + textWidth / 2 + 5 / globalScale,
    nodeVerticalOffset - 6 / globalScale,
    12 / globalScale,
    12 / globalScale,
  ];
}

const calcSize = (val: number, scale: number) =>
  Math.sqrt(Math.max(0, val || 1)) + 1 / scale;

export function drawHideIcon(ctx: CanvasRenderingContext2D, node: Node) {
  if (node.x === undefined) return;
  const { globalScale, textWidth, nodeVerticalOffset, x } = node;
  const hideIcon = new Path2D(
    'M7.84 6.5l4.89-4.84c.176-.174.274-.412.27-.66 0-.552-.447-1-1-1-.25.003-.488.107-.66.29L6.5 5.13 1.64.27C1.47.1 1.24.003 1 0 .448 0 0 .448 0 1c.01.23.105.45.27.61L5.16 6.5.27 11.34c-.177.173-.274.412-.27.66 0 .552.448 1 1 1 .246-.004.48-.105.65-.28L6.5 7.87l4.81 4.858c.183.184.433.28.69.27.553 0 1-.446 1-.998-.01-.23-.105-.45-.27-.61L7.84 6.5z'
  );
  const p = new Path2D();
  const transform = {
    a: 0.8 / globalScale,
    d: 0.8 / globalScale,
    e: x + textWidth / 2 + 5 / globalScale,
    f: nodeVerticalOffset - 6 / globalScale,
  };
  p.addPath(hideIcon, transform);
  ctx.fillStyle = colors.label;
  ctx.fill(p);
}

export function drawHideIconClickBox(node: Node) {
  const rect = new Path2D();
  rect.rect(...hideIconBoxParams(node));
  return rect;
}

export function drawHideIconArea(ctx: CanvasRenderingContext2D, node: Node) {
  ctx.fillRect(...hideIconBoxParams(node));
}

export function drawBubbleArea(ctx: CanvasRenderingContext2D, node: Node) {
  if (node.x === undefined || node.y === undefined) return;
  const { x, y, globalScale, val } = node;
  const size = calcSize(val, globalScale);
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI);
  ctx.fill();
}

export function drawLabelArea(ctx: CanvasRenderingContext2D, node: Node) {
  const { globalScale, textWidth, nodeVerticalOffset, x, nodeFontSize } = node;
  if (x === undefined) return;
  ctx.fillRect(
    x - textWidth / 2,
    nodeVerticalOffset - nodeFontSize + 6 / globalScale,
    textWidth,
    nodeFontSize
  );
}

export function drawAreaInBetween(ctx: CanvasRenderingContext2D, node: Node) {
  const {
    globalScale,
    textWidth,
    nodeVerticalOffset,
    x,
    y,
    nodeFontSize,
    val,
  } = node;
  if (x === undefined || y === undefined) return;
  const size = calcSize(val, globalScale);
  ctx.beginPath();
  ctx.moveTo(
    x - textWidth / 2,
    nodeVerticalOffset - nodeFontSize + 6 / globalScale
  );
  ctx.lineTo(
    x + textWidth / 2 + 20 / globalScale,
    nodeVerticalOffset - nodeFontSize + 6 / globalScale
  );
  ctx.lineTo(x + size / 2, y);
  ctx.lineTo(x - size / 2, y);
  ctx.closePath();
  ctx.fill();
}
