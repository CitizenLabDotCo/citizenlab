import { colors, media } from '@citizenlab/cl2-component-library';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import styled from 'styled-components';

// Custom handling for map width
// Description: This was existing styling prior to Esri migration.
// TODO: Cleanup

export const mapMarginDesktop = 70;
export const mapHeightDesktop = '83vh';
export const mapHeightMobile = '78vh';

export const getInnerContainerLeftMargin = (
  windowWidth: number,
  containerWidth: number
) => {
  const leftMargin =
    Math.round((windowWidth - containerWidth) / 2) - mapMarginDesktop;
  return leftMargin > 0 ? leftMargin : null;
};

export const initialWindowWidth = Math.max(
  document.documentElement.clientWidth || 0,
  window.innerWidth || 0
);
export const initialContainerWidth =
  document?.getElementById('e2e-ideas-container')?.offsetWidth ||
  (initialWindowWidth < maxPageWidth ? initialWindowWidth - 40 : maxPageWidth);

export const initialInnerContainerLeftMargin = getInnerContainerLeftMargin(
  initialWindowWidth,
  initialContainerWidth
);

export const InnerContainer = styled.div<{
  leftMargin: number | null;
  isPostingEnabled: boolean;
}>`
  width: ${({ leftMargin }) =>
    leftMargin ? `calc(100vw - ${70 * 2}px)` : '100%'};
  margin-left: ${({ leftMargin }) =>
    leftMargin ? `-${leftMargin}px` : 'auto'};
  position: relative;

  @media screen and (min-width: 2000px) {
    width: 1800px;
    margin-left: -${(1800 - maxPageWidth) / 2}px;
  }

  > .create-idea-wrapper {
    display: none;
  }

  .activeArea {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    left: 500px;
  }

  & .pbAssignBudgetControlContainer {
    padding: 20px;
    background: ${colors.background};
  }

  ${(props) =>
    media.desktop`
      & .leaflet-control-zoom {
        margin-top: ${props.isPostingEnabled ? '78px' : '25px'} !important;
        margin-right: 14px !important;
      }
  
      & .leaflet-control-layers {
        margin-right: 15px !important;
      }
    `}

  ${media.tablet`
      .activeArea {
        left: 0px;
      }
    `}
`;
