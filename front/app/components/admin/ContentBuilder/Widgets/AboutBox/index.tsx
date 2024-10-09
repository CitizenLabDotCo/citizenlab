import React from 'react';

import { Box, colors, Toggle } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { useParams } from 'react-router-dom';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';

import { useIntl } from 'utils/cl-intl';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import messages from './messages';

type AboutBoxProps = {
  hideParticipationNumbers?: boolean;
};

const AboutBox = ({ hideParticipationNumbers }: AboutBoxProps) => {
  const { projectId, slug } = useParams() as {
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
          hideParticipationNumbers={hideParticipationNumbers}
        />
      )}
    </Box>
  );
};

const AboutBoxSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    hideParticipationNumbers,
  } = useNode((node) => ({
    hideParticipationNumbers: node.data.props.hideParticipationNumbers,
    id: node.id,
  }));

  return (
    <Box background={colors.white} my="32px">
      <Toggle
        checked={hideParticipationNumbers}
        onChange={() => {
          setProp(
            (props: AboutBoxProps) =>
              (props.hideParticipationNumbers = !hideParticipationNumbers)
          );
        }}
        label={formatMessage(messages.hideParticipationNumbersText)}
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

export default AboutBox;
