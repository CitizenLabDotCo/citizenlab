import { fontSizes, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Image from 'components/UI/Image';

import { trackEventByName } from 'utils/analytics';

import tracks from './tracks';

export const handleProjectCardOnClick = (projectId: string) => {
  trackEventByName(tracks.clickOnProjectCard, { extra: { projectId } });
};

export const handleCTAOnClick = (projectId: string) => {
  trackEventByName(tracks.clickOnProjectCardCTA, { extra: { projectId } });
};

export const handleProjectTitleOnClick = (projectId: string) => {
  trackEventByName(tracks.clickOnProjectTitle, { extra: { projectId } });
};

export const ProjectImage = styled(Image)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

export const ProjectTitle = styled.h3`
  line-height: normal;
  font-weight: 500;
  font-size: ${fontSizes.xl}px;
  color: ${({ theme }) => theme.colors.tenantText};
  margin: 0;
  padding: 0;

  ${isRtl`
    text-align: right;
  `}

  &:hover {
    text-decoration: underline;
  }
`;
