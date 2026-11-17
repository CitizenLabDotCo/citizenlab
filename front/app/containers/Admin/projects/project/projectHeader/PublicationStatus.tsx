import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  project: IProjectData;
}

interface Status {
  message: MessageDescriptor;
  icon: IconNames;
  color: string;
}

const getStatus = (
  attrs: IProjectData['attributes'],
  phases: IPhaseData[] | undefined
): Status => {
  if (!attrs.first_published_at && attrs.scheduled_at) {
    return {
      message: messages.scheduled,
      icon: 'clock',
      color: colors.coolGrey600,
    };
  }
  if (attrs.publication_status === 'archived') {
    return {
      message: messages.archived,
      icon: 'inbox',
      color: colors.coolGrey600,
    };
  }
  if (attrs.publication_status === 'published') {
    const noPhases = (phases?.length ?? 0) === 0;
    const isOngoing = phases?.some(
      (phase) =>
        !phase.attributes.end_at ||
        moment(phase.attributes.end_at).isSameOrAfter(moment().startOf('day'))
    );
    if (noPhases || isOngoing) {
      return {
        message: messages.publishedActive,
        icon: 'check-circle',
        color: colors.green500,
      };
    }
    return {
      message: messages.publishedFinished,
      icon: 'bullseye',
      color: colors.coolGrey600,
    };
  }
  return {
    message: messages.draft,
    icon: 'flag',
    color: colors.orange500,
  };
};

const PublicationStatus = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(project.id);

  const status = getStatus(project.attributes, phases?.data);

  return (
    <Box display="flex" alignItems="center" gap="4px">
      <Icon name={status.icon} fill={status.color} width="16px" />
      <Text color="coolGrey600" fontSize="s" m="0px">
        {formatMessage(status.message)}
      </Text>
    </Box>
  );
};

export default PublicationStatus;
