import messages from './messages';

export const getEmptyMessage = ({
  projectId,
  phaseId,
}: {
  projectId?: string;
  phaseId?: string;
}) => {
  if (!projectId) return messages.noProjectSelected;
  if (!phaseId) return messages.noPhaseSelected;
  return;
};
