import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { IOption } from 'typings';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { ProjectPublicationStatusProps } from '../typings';

export const ProjectPublicationStatus = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    projectPublicationStatus,
  } = useNode((node) => ({
    projectPublicationStatus: node.data.props.projectPublicationStatus,
  }));

  const handleProjectPublicationStatusFilter = ({ value }: IOption) => {
    setProp((props: ProjectPublicationStatusProps) => {
      props.projectPublicationStatus = value;
    });
  };

  const options: IOption[] = [
    { value: 'published', label: formatMessage(messages.publishedLabel) },
    { value: 'archived', label: formatMessage(messages.archivedLabel) },
  ];

  return (
    <Box mb="20px">
      <Select
        label={formatMessage(messages.projectPublicationStatusLabel)}
        onChange={handleProjectPublicationStatusFilter}
        value={projectPublicationStatus}
        options={options}
        canBeEmpty
      />
    </Box>
  );
};
