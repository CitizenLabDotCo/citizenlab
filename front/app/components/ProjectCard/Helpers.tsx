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
