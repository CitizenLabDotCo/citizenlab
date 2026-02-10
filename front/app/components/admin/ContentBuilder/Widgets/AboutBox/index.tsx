import React from 'react';

import { Box, colors, Toggle } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { useParams } from 'utils/router';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';

import { useIntl } from 'utils/cl-intl';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import messages from './messages';

type AboutBoxProps = {
  hideParticipationAvatars?: boolean;
};

const AboutBox = ({ hideParticipationAvatars }: AboutBoxProps) => {
  const { projectId, slug } = useParams({ strict: false }) as {
    projectId: string;
    slug: string;
  };
  const { data: project } = useProjectBySlug(slug);
  const projectID = projectId || project?.data.id;
  const componentDefaultPadding = useCraftComponentDefaultPadding();
  return (
    <Box
      id="e2e-about-box"
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {projectID && (
        <ProjectInfoSideBar
          projectId={projectID}
          hideParticipationAvatars={hideParticipationAvatars}
        />
      )}
    </Box>
  );
};

const AboutBoxSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    hideParticipationAvatars,
  } = useNode((node) => ({
    hideParticipationAvatars: node.data.props.hideParticipationAvatars,
    id: node.id,
  }));

  return (
    <Box background={colors.white} my="32px">
      <Toggle
        checked={hideParticipationAvatars}
        onChange={() => {
          setProp(
            (props: AboutBoxProps) =>
              (props.hideParticipationAvatars = !hideParticipationAvatars)
          );
        }}
        label={formatMessage(messages.hideParticipationAvatarsText)}
      />
    </Box>
  );
};

AboutBox.craft = {
  related: {
    settings: AboutBoxSettings,
  },
  custom: {
    title: messages.participationBox,
    noPointerEvents: true,
  },
};

export const aboutBoxTitle = messages.participationBox;

export default AboutBox;
