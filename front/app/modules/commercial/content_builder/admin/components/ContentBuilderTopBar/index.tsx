import React from 'react';

// Hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Box, stylingConsts, Spinner } from '@citizenlab/cl2-component-library';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter } from 'react-router';

// libraries
import clHistory from 'utils/cl-router/history';

const ProjectTitle = styled.p`
  margin-bottom: 6px;
  color: ${colors.adminSecondaryTextColor};
`;

const BuilderTitle = styled.h1`
  margin: 0px;
  font-size: 18px;
`;

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
      borderBottom={`1px solid ${colors.border}`}
    >
      <Box
        p="15px"
        w="220px"
        h="100%"
        borderRight={`1px solid ${colors.border}`}
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
              <ProjectTitle>
                {localize(project.attributes.title_multiloc)}
              </ProjectTitle>
              <BuilderTitle>
                <FormattedMessage {...messages.descriptionTopicManagerText} />
              </BuilderTitle>
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
