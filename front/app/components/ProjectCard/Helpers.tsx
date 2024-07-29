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
