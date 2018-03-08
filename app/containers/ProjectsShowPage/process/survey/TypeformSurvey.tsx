import * as React from 'react';
import * as typeformEmbed from '@typeform/embed';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  position: relative;
`;

type Props = {
  typeformUrl: string,
  email: string | null,
};

type State = {};

class TypeformSurvey extends React.PureComponent<Props, State> {
  typeformElement: HTMLElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { email, typeformUrl } = this.props;
    const surveyUrl = (email ? `${typeformUrl}?email=${email}` : typeformUrl);

    if (this.typeformElement) {
      typeformEmbed.makeWidget(this.typeformElement, surveyUrl, {
        hideFooter: true,
        hideScrollbars: false,
        hideHeaders: true,
      });
    }
  }

  setRef = (element) => {
    this.typeformElement = element;
  }

  render() {
    const style = {
      height: '500px',
      border: '1px solid #e4e4e4'
    };

    return (
      <Container className={this.props['className']}>
        <div ref={this.setRef} style={style} />
      </Container>
    );
  }
}

export default TypeformSurvey;
