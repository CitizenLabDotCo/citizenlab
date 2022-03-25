import React from 'react';

// Hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';

// Styling
import { colors } from 'utils/styleUtils';
import {
  Box,
  stylingConsts,
  Spinner,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter } from 'react-router';

// libraries
import clHistory from 'utils/cl-router/history';

const ContentBuilderPage = ({ params: { projectId } }) => {
  const localize = useLocalize();
  const project = useProject({ projectId });

  const goBack = () => {
    clHistory.goBack();
  };

  return (
    <Box
      alignItems="center"
      w="100%"
      h={`${stylingConsts.menuHeight}px`}
      display="flex"
      background={`${colors.adminContentBackground}`}
      borderBottom={`1px solid ${colors.mediumGrey}`}
    >
      <Box
        p="15px"
        w="220px"
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
              <Text mb="8px" color="adminSecondaryTextColor">
                {localize(project.attributes.title_multiloc)}
              </Text>
              <Title variant="h4" as="h1">
                <FormattedMessage {...messages.descriptionTopicManagerText} />
              </Title>
            </>
          )}
        </Box>
        <Button buttonStyle="primary" onClick={goBack}>
          <FormattedMessage {...messages.contentBuilderSave} />
        </Button>
      </Box>
    </Box>
  );
};

export default withRouter(ContentBuilderPage);
