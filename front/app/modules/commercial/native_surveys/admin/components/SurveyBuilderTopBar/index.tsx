import React from 'react';

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
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

const SurveyBuilderTopBar = ({ params: { projectId } }: WithRouterProps) => {
  const localize = useLocalize();
  const project = useProject({ projectId });

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
      background={`${colors.adminContentBackground}`}
      borderBottom={`1px solid ${colors.mediumGrey}`}
    >
      <Box
        p="15px"
        w="210px"
        h="100%"
        borderRight={`1px solid ${colors.mediumGrey}`}
        display="flex"
        alignItems="center"
      >
        <GoBackButton onClick={goBack} />
      </Box>
      <Box display="flex" p="15px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          {isNilOrError(project) ? (
            <Spinner />
          ) : (
            <>
              <Text mb="0px" color="adminSecondaryTextColor">
                {localize(project.attributes.title_multiloc)}
              </Text>
              <Title variant="h4" as="h1">
                <FormattedMessage {...messages.survey} />
              </Title>
            </>
          )}
        </Box>
        <Box ml="24px" />
        <Button
          id="e2e-view-project-button"
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
          onClick={() => {}}
          data-testid="contentBuilderTopBarSaveButton"
        >
          <FormattedMessage {...messages.saveSurvey} />
        </Button>
      </Box>
    </Box>
  );
};

export default withRouter(SurveyBuilderTopBar);
