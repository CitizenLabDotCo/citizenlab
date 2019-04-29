import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaCards from 'components/IdeaCards';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div``;

const IdeasTitle = styled.h1`
  color: ${colors.text};
  font-size: ${fontSizes.xxxl}px;
  line-height: normal;
  font-weight: 600;
  margin-bottom: 15px;

  ${media.biggerThanMinTablet`
    display: none;
  `}
`;

const StyledIdeaCards = styled(IdeaCards)`
  &.budgeting {
    margin-top: 200px;

    ${media.smallerThanMaxTablet`
      margin-top: 180px;
    `}
  }
`;

interface InputProps {
  projectId: string;
  phaseId: string;
  className?: string;
}

interface DataProps {
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PhaseIdeas extends PureComponent<Props, State> {
  render() {
    const { projectId, phaseId, phase, className } = this.props;
    const projectIds = [projectId];

    if (!isNilOrError(phase)) {
      const participationMethod = phase.attributes.participation_method;

      if ((participationMethod === 'ideation' || participationMethod === 'budgeting')) {
        return (
          <Container className={className}>
            <IdeasTitle>
              <FormattedMessage {...messages.navIdeas} />
            </IdeasTitle>
            <StyledIdeaCards
              className={participationMethod}
              type="load-more"
              sort={'trending'}
              pageSize={12}
              projectIds={projectIds}
              phaseId={phaseId}
              showViewToggle={true}
              defaultView={phase.attributes.presentation_mode}
              participationMethod={participationMethod}
              participationContextId={phase.id}
              participationContextType="Phase"
            />
          </Container>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PhaseIdeas {...inputProps} {...dataProps} />}
  </Data>
);
