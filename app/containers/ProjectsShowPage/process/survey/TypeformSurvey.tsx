import * as React from 'react';
import * as typeformEmbed from '@typeform/embed';
import styled from 'styled-components';


const SurveyContainer = styled.div`
  height: 500px;
`;

type Props = {
  typeformUrl: string,
  email: string | null,
};

type State = {};

class TypeformSurvey extends React.Component<Props, State> {

  surveyContainer: HTMLElement | null = null;

  surveyUrl = () => {
    if (this.props.email) {
      return `${this.props.typeformUrl}?email=${this.props.email}`;
    } else {
      return this.props.typeformUrl;
    }
  }

  componentDidMount() {
    typeformEmbed.makeWidget(this.surveyContainer, this.surveyUrl(), {
      hideFooter: true,
      hideScrollbars: true,
      hideHeaders: true,
    });
  }

  setRef = (r) => this.surveyContainer = r;

  render() {
    return (
      <SurveyContainer innerRef={this.setRef} />
    );
  }

}

export default TypeformSurvey;
