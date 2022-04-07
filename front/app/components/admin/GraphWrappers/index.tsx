import styled from 'styled-components';
import { media, colors, fontSizes, defaultCardStyle } from 'utils/styleUtils';

export const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

export const GraphsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  margin: 20px -10px;
  background: inherit;
  @media print {
    flex-direction: column;
    position: relative;
    align-items: center;
  }
`;

export const Column = styled.div`
  width: 50%;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  &.first {
    margin-right: 20px;
  }
  @media print {
    position: relative;
    width: 100%;
  }
`;

export const NoDataContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  font-size: ${fontSizes.base}px;
  /*
   * Needed to vertically center the text
   * Reason being: we have a margin-bottom on the header,
   * Which we want to keep when there's an actual graph
   */
  padding: 20px;
`;

export const GraphCardInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 35px;
  ${defaultCardStyle}
  p {
    font-size: ${fontSizes.base}px;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  @media print {
    position: relative;
    display: block;
    page-break-inside: avoid;
    width: 100%;
    padding: 0 10px;
    border: none;
  }
`;

export const GraphCard = styled.div`
  padding: 10px;
  height: 350px;
  display: flex;
  width: 50%;

  &.dynamicHeight {
    height: auto;

    ${GraphCardInner} {
      position: relative;
    }
  }

  &.fullWidth {
    width: 100%;
  }
  @media print {
    position: relative;
    display: block;
    page-break-before: always;
    page-break-inside: avoid;
    height: 400px;
  }
  @media print and (orientation: portrait) {
    width: 100%;
  }
  @media print and (orientation: landscape) {
    width: 50%;
  }
`;

export const GraphCardHeader = styled.div`
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  font-size: ${fontSizes.xl}px;
  font-weight: 400;
  margin-bottom: 20px;
  padding: 20px;
  @media print {
    display: block;
    justify-content: flex-start;
    page-break-after: avoid;
    page-break-before: always;
    page-break-inside: avoid;
    h3 {
      margin-right: 20px;
    }
  }
`;

export const PieChartStyleFixesDiv = styled.div`
  overflow: hidden;
  .recharts-surface,
  .recharts-wrapper,
  .recharts-responsive-container {
    height: 195px !important;
    min-width: 190px;
    overflow: visible;
  }
`;

export const GraphCardHeaderWithFilter = styled(GraphCardHeader)`
  align-items: center;

  ${media.smallerThan1280px`
    flex-direction: column;
    align-items: flex-start;
    margin-top: 0px;
  `}
`;

export const GraphCardTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0;
`;

export const GraphCardFigureContainer = styled.div`
  margin-left: 10px;
  display: flex;
  align-items: center;
`;

export const GraphCardFigure = styled.span`
  margin-right: 5px;
  font-weight: 600;
`;

export const GraphCardFigureChange = styled.span`
  font-size: ${fontSizes.base}px;

  &.increase {
    color: ${colors.clGreenSuccess};
  }

  &.decrease {
    color: ${colors.clRedError};
  }
`;

export type IGraphUnit = 'users' | 'ideas' | 'comments' | 'votes' | 'responses';
