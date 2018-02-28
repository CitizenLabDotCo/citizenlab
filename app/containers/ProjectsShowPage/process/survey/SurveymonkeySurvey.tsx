import * as React from 'react';
import styled from 'styled-components';


const SurveyContainer = styled.div`
  display: flex;
  justify-content: center;
`;

type Props = {
  surveymonkeyUrl: string,
};

type State = {};

class SurveymonekySurvey extends React.Component<Props, State> {

  surveyContainer: HTMLElement | null = null;

  componentDidMount() {
    if (!document.getElementById('smcx-sdk')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'smcx-sdk';
      script.async = true;
      script.src = this.props.surveymonkeyUrl;
      this.surveyContainer && this.surveyContainer.appendChild(script);
    }
  }

  setRef = (r) => this.surveyContainer = r;

  render() {
    return (
      <div>
        <SurveyContainer innerRef={this.setRef} />
      </div>
    );
  }

}

export default SurveymonekySurvey;
