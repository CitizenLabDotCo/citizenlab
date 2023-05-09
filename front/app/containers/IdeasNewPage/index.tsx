import React from 'react';
import { createPortal } from 'react-dom';
import { parse } from 'qs';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';

import IdeasNewForm from './IdeasNewForm';

// style
import { colors } from 'utils/styleUtils';

// hooks
import useProjectBySlug from 'api/projects/useProjectBySlug';
import usePhases from 'hooks/usePhases';
import { getParticipationMethod } from 'utils/participationMethodUtils';

// utils
import { isError } from 'lodash-es';
import { isUnauthorizedError } from 'utils/helperUtils';
import { useParams } from 'react-router-dom';

interface InputProps {}

const NewIdeaPage = (inputProps: InputProps) => {
  const { slug } = useParams();

  const isSmallerThanPhone = useBreakpoint('phone');
  const { data: project } = useProjectBySlug(slug);
  const phases = usePhases(project?.data.id);
  const { phase_id } = parse(location.search, {
    ignoreQueryPrefix: true,
  }) as { [key: string]: string };

  if (isUnauthorizedError(project)) {
    return <Unauthorized />;
  }

  if (isError(project)) {
    return <PageNotFound />;
  }

  const participationMethod = getParticipationMethod(
    project?.data as any,
    phases,
    phase_id
  );
  const portalElement = document?.getElementById('modal-portal');
  const isSurvey = participationMethod === 'native_survey';

  if (isSurvey && portalElement && isSmallerThanPhone) {
    return createPortal(
      <Box
        display="flex"
        flexDirection="column"
        w="100%"
        zIndex="10000"
        position="fixed"
        bgColor={colors.background}
        h="100vh"
        overflowY="scroll"
      >
        <IdeasNewForm {...inputProps} />
      </Box>,
      portalElement
    );
  } else return <IdeasNewForm {...inputProps} />;
};

export default NewIdeaPage;
