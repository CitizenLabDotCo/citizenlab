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

const TopContainer = styled(Box)`
  border-style: solid;
  border-width: 1px;
  border-color: ${colors.separation};
  width: 100%;
  display: flex;
  background: ${colors.adminContentBackground};
  align-items: center;
`;

const HeaderContainerLeft = styled(Box)`
  padding: 15px;
  width: 210px;
`;

const HeaderContainerRight = styled(Box)`
  border-left-style: solid;
  border-left-width: 1px;
  border-left-color: ${colors.separation};
  padding: 15px;
  flex-grow: 1;
  align-items: center;
  display: flex;
  gap: 10px;
`;

const ProjectDescriptionContainer = styled(Box)`
  flex-grow: 2;
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

const ContentBuilderPage = () => {
  const localize = useLocalize();
  const route = window.location.pathname;
  const projectId = route.substring(
    route.indexOf('projects/') + 9,
    route.lastIndexOf('/') - 12
  );
  const project = useProject({ projectId });
  let projectTitle = '';
  if (!isNilOrError(project)) {
    projectTitle = localize(project.attributes.title_multiloc);
  }

  return (
    <TopContainer>
      <HeaderContainerLeft>
        <GoBackButton onClick={dummy} />
      </HeaderContainerLeft>
      <HeaderContainerRight>
        <ProjectDescriptionContainer>
          <ProjectTitle>{projectTitle?.toString()}</ProjectTitle>
          <BuilderTitle>
            <FormattedMessage {...messages.descriptionTopicManagerText} />
          </BuilderTitle>
        </ProjectDescriptionContainer>
        <Button buttonStyle="primary" onClick={dummy}>
          <FormattedMessage {...messages.contentBuilderSave} />
        </Button>
      </HeaderContainerRight>
    </TopContainer>
  );
};

export default ContentBuilderPage;
