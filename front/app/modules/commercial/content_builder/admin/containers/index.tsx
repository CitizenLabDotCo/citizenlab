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
import { Box } from '@citizenlab/cl2-component-library';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter } from 'react-router';

const TopContainer = styled(Box)`
  border-style: solid;
  border-width: 1px;
  border-color: ${colors.separation};
  width: 100%;
  display: flex;
  background: ${colors.adminContentBackground};
  align-items: center;
`;

const ProjectTitle = styled.p`
  margin-bottom: 6px;
  color: ${colors.adminSecondaryTextColor};
`;

const BuilderTitle = styled.h1`
  margin: 0px;
  font-size: 18px;
`;

const dummy = () => {};

const ContentBuilderPage = ({ params: { projectId } }) => {
  const localize = useLocalize();
  const project = useProject({ projectId });

  if (isNilOrError(project)) {
    return null;
  }
  return (
    <TopContainer>
      <Box p="15px" w="210px">
        <GoBackButton onClick={dummy} />
      </Box>
      <Box
        display="flex"
        borderLeft={`1px solid ${colors.separation}`}
        p="15px"
        flexGrow={1}
        alignItems="center"
      >
        <Box flexGrow={2}>
          <ProjectTitle>
            {localize(project.attributes.title_multiloc)}
          </ProjectTitle>
          <BuilderTitle>
            <FormattedMessage {...messages.descriptionTopicManagerText} />
          </BuilderTitle>
        </Box>
        <Button buttonStyle="primary" onClick={dummy}>
          <FormattedMessage {...messages.contentBuilderSave} />
        </Button>
      </Box>
    </TopContainer>
  );
};

export default withRouter(ContentBuilderPage);
