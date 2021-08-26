import React from 'react';
import styled from 'styled-components';

const SurveyContainer = styled.div`
  display: flex;
  justify-content: center;
  .smcx-widget {
    max-width: none;
    z-index: 1;
  }
  .smcx-embed > .smcx-iframe-container {
    max-width: none;
  }
`;

type Props = {
  surveymonkeyUrl: string;
};

interface State {}

class SurveymonekySurvey extends React.PureComponent<Props, State> {
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

  setRef = (element) => {
    this.surveyContainer = element;
  };

  render() {
    return (
      <div>
        <SurveyContainer ref={this.setRef} />
      </div>
    );
  }
}

export default SurveymonekySurvey;
