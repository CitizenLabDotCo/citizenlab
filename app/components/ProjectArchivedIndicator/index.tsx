import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// Resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// Components
import ContentContainer from 'components/ContentContainer';
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Style
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)``;

interface InputProps {
  projectId: string;
  className?: string;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectArchivedIndicator extends PureComponent<Props, State> {
  render() {
    const { project, className } = this.props;

    if (
      !isNilOrError(project) &&
      project.attributes.publication_status === 'archived'
    ) {
      return (
        <StyledContentContainer className={className}>
          <Warning text={<FormattedMessage {...messages.archivedProject} />} />
        </StyledContentContainer>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProjectArchivedIndicator {...inputProps} {...dataProps} />}
  </Data>
);
