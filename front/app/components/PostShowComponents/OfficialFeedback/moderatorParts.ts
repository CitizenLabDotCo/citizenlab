// Moderator-only, so participants on the idea page never download them.
export const loadOfficialFeedbackForm = () => import('./OfficialFeedbackForm');
export const loadOfficialFeedbackPanelMenu = () =>
  import('./OfficialFeedbackPanelMenu');

export const preloadOfficialFeedbackModeratorParts = () => {
  loadOfficialFeedbackForm();
  loadOfficialFeedbackPanelMenu();
};
