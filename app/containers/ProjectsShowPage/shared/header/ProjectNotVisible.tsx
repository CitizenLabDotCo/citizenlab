import React, { memo } from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  height: 100%;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

interface Props {
  className?: string;
}

const ProjectNotVisible = memo<Props>(({ className }) => {
  return (
    <Container className={className || ''}>
      <p>
        <FormattedMessage {...messages.thisProjectIsNotVisibleToYou} />
      </p>
      <Button
        linkTo="/projects"
        text={<FormattedMessage {...messages.goBackToList} />}
        icon="arrow-back"
      />
    </Container>
  );
});

export default ProjectNotVisible;
