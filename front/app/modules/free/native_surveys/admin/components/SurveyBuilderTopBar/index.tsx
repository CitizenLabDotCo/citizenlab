import React, { useState } from 'react';

// hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';

// components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';
import {
  Box,
  stylingConsts,
  Spinner,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { useParams } from 'react-router-dom';

import {
  updateSurveyCustomFields,
  IFlatCustomField,
} from 'modules/free/native_surveys/services/surveyCustomFields';

interface SurveyBuilderTopBarProps {
  surveyCustomFields: IFlatCustomField[] | undefined | Error;
}

const SurveyBuilderTopBar = ({
  surveyCustomFields,
}: SurveyBuilderTopBarProps) => {
  const localize = useLocalize();
  const { projectId } = useParams() as { projectId: string };
  const project = useProject({ projectId });
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/native-survey`);
  };

  const handleSave = async () => {
    if (!isNilOrError(surveyCustomFields)) {
      try {
        setLoading(true);
        const finalResponseArray = surveyCustomFields.map((field) => ({
          ...(!field.isLocalOnly && { id: field.id }),
          input_type: field.input_type,
          required: field.required,
          enabled: field.enabled,
          title_multiloc: field.title_multiloc || {},
          description_multiloc: field.description_multiloc || {},
        }));
        await updateSurveyCustomFields(projectId, finalResponseArray);
      } catch {
        // Do nothing
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
          {isNilOrError(project) ? (
            <Spinner />
          ) : (
            <>
              <Text mb="0px" color="adminSecondaryTextColor">
                {localize(project.attributes.title_multiloc)}
              </Text>
              <Title variant="h4" as="h1">
                <FormattedMessage {...messages.surveyText} />
              </Title>
            </>
          )}
        </Box>
        <Box ml="24px" />
        <Button
          buttonStyle="secondary"
          icon="eye"
          mx="20px"
          disabled={!project}
          linkTo={`/projects/${project?.attributes.slug}`}
          openLinkInNewTab
        >
          <FormattedMessage {...messages.viewSurvey} />
        </Button>
        <Button
          buttonStyle="primary"
          mx="20px"
          disabled={!project}
          processing={loading}
          onClick={handleSave}
        >
          <FormattedMessage {...messages.save} />
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyBuilderTopBar;
