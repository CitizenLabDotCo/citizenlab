import * as React from 'react';
import styled from 'styled-components';


const SurveyContainer = styled.div`
  height: 500px;
`;

type Props = {
  surveymonkeyUrl: string,
  email: string,
};

type State = {};

const snippet = `(function(t,e,s,n){var o,a,c;t.SMCX=t.SMCX||[],e.getElementById(n)||(o=e.getElementsByTagName(s),a=o[o.length-1],c=e.createElement(s),c.type="text/javascript",c.async=!0,c.id=n,c.src=["https:"===location.protocol?"https://":"http://","widget.surveymonkey.com/collect/website/js/tRaiETqnLgj758hTBazgdzb10xM0gw6PpST3dV5PBW634zijaMtcCqMLjmW9NSE4.js"].join(""),a.parentNode.insertBefore(c,a))})(window,document,"script","smcx-sdk");`;

class SurveymonekySurvey extends React.Component<Props, State> {

  surveyContainer: HTMLElement | null = null;

  componentDidMount() {
      debugger;
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = snippet;
      script.async = true;

     this.surveyContainer && this.surveyContainer.appendChild(script);
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
