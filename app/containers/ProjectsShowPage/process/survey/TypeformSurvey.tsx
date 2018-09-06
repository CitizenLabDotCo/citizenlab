import React, { PureComponent } from 'react';
import { makePopup } from '@typeform/embed';
import styled from 'styled-components';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

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

class TypeformSurvey extends PureComponent<Props, State> {
  typeformReference: any;

  componentDidMount() {
    const { email, typeformUrl } = this.props;
    const surveyUrl = (email ? `${typeformUrl}?email=${email}` : typeformUrl);

    this.typeformReference = makePopup(surveyUrl, {
      mode: 'popup',
      autoOpen: false,
      onSubmit: () => this.closeSurvey
    });
  }

  closeSurvey = () => {
    setTimeout(() => this.typeformReference.close(), 3000);
  }

  openSurvey = () => {
    this.typeformReference.open();
  }

  render() {
    return (
      <Container className={this.props['className']}>
        <ButtonWrapper>
          <Button onClick={this.openSurvey} size="2">
            <FormattedMessage {...messages.fillInSurvey} />
          </Button>
        </ButtonWrapper>
      </Container>
    );
  }
}

export default TypeformSurvey;
