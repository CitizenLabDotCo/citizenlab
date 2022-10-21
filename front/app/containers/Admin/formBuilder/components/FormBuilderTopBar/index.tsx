import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import usePhase from 'hooks/usePhase';
import useProject from 'hooks/useProject';

// components
import Button from 'components/UI/Button';
import GoBackButton from 'components/UI/GoBackButton';

// styling
import {
  Box,
  StatusLabel,
  stylingConsts,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { getIsPostingEnabled } from 'containers/Admin/formBuilder/utils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// routing
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

const StyledStatusLabel = styled(StatusLabel)`
  height: 20px;
  margin-bottom: auto;
`;

type FormBuilderTopBarProps = {
  isSubmitting: boolean;
  isEditingDisabled: boolean;
};

const FormBuilderTopBar = ({
  isSubmitting,
  isEditingDisabled,
}: FormBuilderTopBarProps) => {
  const localize = useLocalize();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const project = useProject({ projectId });
  const phase = usePhase(phaseId || null);

  if (isNilOrError(project)) {
    return null;
  }

  const isPostingEnabled = getIsPostingEnabled(project, phase);
  const viewSurveyLInk = phaseId
    ? `/projects/${project?.attributes.slug}/ideas/new?phase_id=${phaseId}`
    : `/projects/${project?.attributes.slug}/ideas/new`;

  // TODO : Generalize this form builder and use new ParticipationMethod abstraction to control method specific copy, etc.
  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/native-survey`);
  };

  return (
    <Box
      position="fixed"
      zIndex="3"
      alignItems="center"
      w="100%"
      h={`${stylingConsts.menuHeight}px`}
      display="flex"
      background={`${colors.white}`}
      borderBottom={`1px solid ${colors.grey500}`}
      top="0px"
    >
      <Box
        p="16px"
        w="210px"
        h="100%"
        borderRight={`1px solid ${colors.grey500}`}
        display="flex"
        alignItems="center"
      >
        <GoBackButton onClick={goBack} />
      </Box>
      <Box display="flex" p="16px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Text mb="0px" color="textSecondary">
            {localize(project.attributes.title_multiloc)}
          </Text>
          <Box display="flex" alignContent="center" mt="4px">
            <Title marginRight="8px" marginTop="0" variant="h4" as="h1">
              <FormattedMessage {...messages.surveyTitle} />
            </Title>
            <StyledStatusLabel
              text={
                isPostingEnabled ? (
                  <span style={{ color: colors.success }}>
                    <FormattedMessage {...messages.open} />
                  </span>
                ) : (
                  <span style={{ color: colors.red400 }}>
                    <FormattedMessage {...messages.closed} />
                  </span>
                )
              }
              backgroundColor={
                isPostingEnabled ? colors.successLight : colors.errorLight
              }
            />
          </Box>
        </Box>
        <Box ml="24px" />
        <Button
          buttonStyle="secondary"
          icon="eye"
          mx="20px"
          disabled={!project}
          linkTo={viewSurveyLInk}
          openLinkInNewTab
          data-cy="e2e-preview-form-button"
        >
          <FormattedMessage {...messages.viewSurvey} />
        </Button>
        <Button
          buttonStyle="primary"
          disabled={isEditingDisabled}
          processing={isSubmitting}
          type="submit"
        >
          <FormattedMessage {...messages.save} />
        </Button>
      </Box>
    </Box>
  );
};

export default FormBuilderTopBar;
