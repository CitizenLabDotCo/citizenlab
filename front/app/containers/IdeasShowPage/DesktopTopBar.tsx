import React, { useState, useCallback, useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { IProjectData } from 'api/projects/types';

import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import messages from '../IdeasShow/messages';

interface Props {
  project: IProjectData;
}

const TopBar = ({ project }: Props) => {
  const [searchParams] = useSearchParams();
  const goBackParameter = searchParams.get('go_back');
  const [goBack] = useState(goBackParameter === 'true');
  const { formatMessage } = useIntl();

  useEffect(() => {
    removeSearchParams(['go_back']);
  }, []);

  const handleGoBack = useCallback(() => {
    if (goBack) {
      clHistory.back();
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (project) {
      clHistory.push(`/projects/${project.attributes.slug}`);
    } else {
      clHistory.push('/');
    }
  }, [goBack, project]);

  return (
    <Box display="flex" alignItems="center" p="32px" pb="0">
      <GoBackButtonSolid
        text={formatMessage(messages.goBack)}
        onClick={handleGoBack}
      />
    </Box>
  );
};

export default TopBar;
