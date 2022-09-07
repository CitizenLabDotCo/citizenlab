import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

// hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';
import usePhase from 'hooks/usePhase';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';
import {
  Box,
  stylingConsts,
  Text,
  Title,
  StatusLabel,
} from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getIsPostingEnabled } from 'containers/Admin/formBuilder/utils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { useParams } from 'react-router-dom';

// services
import {
  IFlatCustomField,
  updateFormCustomFields,
} from 'services/formCustomFields';

const StyledStatusLabel = styled(StatusLabel)`
  height: 20px;
  margin-bottom: auto;
`;

const FormBuilderTopBar = () => {
  const localize = useLocalize();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const project = useProject({ projectId });
  const [loading, setLoading] = useState(false);
  const { watch } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const phase = usePhase(phaseId || null);

  if (isNilOrError(project)) {
    return null;
  }

  const isPostingEnabled = getIsPostingEnabled(project, phase);
  const viewSurveyLInk = phaseId
    ? `/projects/${project?.attributes.slug}/ideas/new?phase_id=${phaseId}`
    : `/projects/${project?.attributes.slug}/ideas/new`;

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/native-survey`);
  };

  const save = async () => {
    if (!isNilOrError(formCustomFields)) {
      try {
        setLoading(true);
        const finalResponseArray = formCustomFields.map((field) => ({
          ...(!field.isLocalOnly && { id: field.id }),
          input_type: field.input_type,
          required: field.required,
          enabled: field.enabled,
          title_multiloc: field.title_multiloc || {},
          description_multiloc: field.description_multiloc || {},
          ...(field.input_type === 'multiselect' && {
            options: field.options || {},
          }),
          ...(field.input_type === 'linear_scale' && {
            minimum_label_multiloc: field.minimum_label_multiloc || {},
            maximum_label_multiloc: field.maximum_label_multiloc || {},
            maximum: field.maximum,
          }),
        }));
        await updateFormCustomFields(projectId, finalResponseArray, phaseId);
      } catch {
        // TODO: Add error handling
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box
      position="fixed"
      zIndex="3"
      alignItems="center"
      w="100%"
      h={`${stylingConsts.menuHeight}px`}
      display="flex"
      background={`${colors.adminContentBackground}`}
      borderBottom={`1px solid ${colors.mediumGrey}`}
    >
      <Box
        p="16px"
        w="212px"
        h="100%"
        borderRight={`1px solid ${colors.mediumGrey}`}
        display="flex"
        alignItems="center"
      >
        <GoBackButton onClick={goBack} />
      </Box>
      <Box display="flex" p="16px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Text mb="0px" color="adminSecondaryTextColor">
            {localize(project.attributes.title_multiloc)}
          </Text>
          <Box display="flex" alignContent="center">
            <Title marginRight="8px" marginTop="auto" variant="h4" as="h1">
              <FormattedMessage {...messages.surveyTitle} />
            </Title>
            <StyledStatusLabel
              text={
                isPostingEnabled ? (
                  <span style={{ color: colors.clGreen }}>
                    <FormattedMessage {...messages.open} />
                  </span>
                ) : (
                  <span style={{ color: colors.grey }}>
                    <FormattedMessage {...messages.closed} />
                  </span>
                )
              }
              backgroundColor={
                isPostingEnabled
                  ? colors.clGreenSuccessBackground
                  : colors.backgroundLightGrey
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
        >
          <FormattedMessage {...messages.viewSurvey} />
        </Button>
        <Button
          buttonStyle="primary"
          mx="20px"
          disabled={!project}
          processing={loading}
          onClick={save}
        >
          <FormattedMessage {...messages.save} />
        </Button>
      </Box>
    </Box>
  );
};

export default FormBuilderTopBar;
