import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { quillEditedContent, fontSizes, colors } from 'utils/styleUtils';
import T from 'components/T';

const Container = styled.div`
  border-radius: 5px;
  background-color: #f1f2f3;
  padding: 25px 30px 30px;
`;

const InformationTitle = styled.h2`
  color: #333;
  font-size: ${fontSizes.large}px;
  font-weight: 600;
`;

const InformationBody = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.large}px;

  & span > p {
    margin-bottom: 0;
    line-height: ${fontSizes.xxl}px;
  }

  strong {
    font-weight: 500;
  }

  ${quillEditedContent()}
`;

interface InputProps {
  phaseId: string | null;
}

interface DataProps {
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PhaseAbout extends PureComponent<Props, State> {
  render() {
    const { phase } = this.props;

    if (!isNilOrError(phase)) {
      return (
        <Container className={this.props['className']}>
          <InformationTitle>
            <FormattedMessage {...messages.aboutThisPhase} />
          </InformationTitle>
          <InformationBody>
            <T value={phase.attributes.description_multiloc} supportHtml={true} />
          </InformationBody>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PhaseAbout {...inputProps} {...dataProps} />}
  </Data>
);
