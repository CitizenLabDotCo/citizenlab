import React from 'react';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import ButtonWithLink, { ButtonProps } from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ViewSurveyButton = ({ ...props }: ButtonProps) => {
  const { formatMessage } = useIntl();
  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  if (!project || !phaseId) {
    return null;
  }

  return (
    <ButtonWithLink
      linkTo={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phaseId}`}
      icon="eye"
      iconSize="20px"
      buttonStyle="secondary-outlined"
      width="auto"
      openLinkInNewTab
      mr="8px"
      {...props}
    >
      {formatMessage(messages.viewSurveyText)}
    </ButtonWithLink>
  );
};

export default ViewSurveyButton;
