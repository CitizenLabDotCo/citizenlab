import React from 'react';
import { makeWidget, makePopup } from '@typeform/embed';
import styled from 'styled-components';
import Button from 'components/UI/Button';

const Container = styled.div`
  width: 100%;
  position: relative;
`;

const ButtonWrapper = styled.div`
  margin: 2rem 0;
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
      // makeWidget(this.typeformElement, surveyUrl, {
      //   hideFooter: true,
      //   hideHeaders: true
      // });

      makePopup(surveyUrl, {
        mode: 'drawer_left',
        autoOpen: true
      });
    }
  }

  setRef = (element) => {
    this.typeformElement = element;
  }

  openSurvey = () => {
    const { email, typeformUrl } = this.props;
    const surveyUrl = (email ? `${typeformUrl}?email=${email}` : typeformUrl);

    makePopup(surveyUrl, {
      mode: 'drawer_left',
      autoOpen: true,
    });
  }

  render() {
    const style = {
      width: '100%',
      height: '500px',
      border: '1px solid #e4e4e4'
    };

    return (
      <Container className={this.props['className']}>
        <ButtonWrapper>
          <Button onClick={this.openSurvey}>Save</Button>
        </ButtonWrapper>
        {/* <div ref={this.setRef} style={style} /> */}
      </Container>
    );
  }
}

export default TypeformSurvey;
