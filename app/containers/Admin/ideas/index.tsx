import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import HelmetIntl from 'components/HelmetIntl';
import PageWrapper from 'components/admin/PageWrapper';
import IdeaManager from 'components/admin/IdeaManager';
import IdeaButton from 'components/IdeaButton';
import { PageTitle, SectionSubtitle } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const Left = styled.div`
  margin-right: 80px;
`;

export interface Props {
  projects: GetProjectsChildProps;
}

// i18n
import messages from './messages';

class IdeaDashboard extends React.PureComponent<Props> {
  render() {
    const { projects } = this.props;

    return (
      <>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <HeaderContainer>
          <Left>
            <PageTitle>
              <FormattedMessage {...messages.header} />
            </PageTitle>
            <SectionSubtitle>
              <FormattedMessage {...messages.headerSubtitle} />
            </SectionSubtitle>
          </Left>
          <IdeaButton />
        </HeaderContainer>

        <PageWrapper>
          {projects && projects.projectsList !== undefined &&
            <IdeaManager
              type="AllIdeas"
              visibleFilterMenus={['projects', 'topics', 'statuses']}
              projects={!isNilOrError(projects.projectsList) ? projects.projectsList : null}
            />
          }
        </PageWrapper>
      </>
    );
  }
}

const Data = adopt<Props>({
  projects: <GetProjects pageSize={250} sort="new" publicationStatuses={['draft', 'published', 'archived']} filterCanModerate={true} />,
});

export default () => (
  <Data>
    {dataProps => <IdeaDashboard{...dataProps} />}
  </Data>
);
