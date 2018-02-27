import * as React from 'react';
import * as typeformEmbed from '@typeform/embed';
import styled from 'styled-components';


const SurveyContainer = styled.div`
  height: 500px;
`;

type Props = {
  surveyId?: string,
  surveyService?: string,
};

type State = {};

class Survey extends React.Component<Props, State> {

  surveyContainer: HTMLElement | null = null;

  componentDidMount() {
    typeformEmbed.makeWidget(this.surveyContainer, `https://${this.props.surveyId}`, {
      hideFooter: true,
      hideScrollbars: true,
      hideHeaders: true,
    });
  }

  setRef = (r) => this.surveyContainer = r;

  render() {
    const { surveyId, surveyService } = this.props;

    if (surveyId && surveyService) {
      return (
        <SurveyContainer innerRef={this.setRef} />
      );
    } else {
      return (
        <div>Your survey is not correctly configured</div>
      );
    }
  }

}

export default Survey;
