import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type Props = {
  typeformUrl: string,
  email: string | null,
};

type State = {};

export default class TypeformSurvey extends PureComponent<Props, State> {
  render() {
    const { email, typeformUrl } = this.props;
    const surveyUrl = (email ? `${typeformUrl}?email=${email}` : typeformUrl);

    return (
      <Container className={this.props['className']}>
        <Button linkTo={surveyUrl} openInNewTab={true} size="2" fullWidth={true}>
          <FormattedMessage {...messages.openSurvey} />
        </Button>
      </Container>
    );
  }
}
