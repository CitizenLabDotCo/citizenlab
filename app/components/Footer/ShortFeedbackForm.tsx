// libraries
import React, { PureComponent } from 'react';
import { omit } from 'lodash-es';
import { adopt } from 'react-adopt';
import styled from 'styled-components';

// translations
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Input from 'components/UI/Input';
import { SectionTitle, SectionSubtitle, SectionField } from 'components/admin/Section';
import Label from 'components/UI/Label';
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// resources, services, typings
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { postProductFeedback } from 'services/productFeedback';
import { removeUrlLocale } from 'services/locale';
import { CLError } from 'typings';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface DataProps {
  locale: GetLocaleChildProps;
}

interface InputProps {
  closeModal: () => void;
}

interface Props extends InputProps, DataProps {}

interface State {
  emailValue: string;
  feedbackValue: string;
  apiErrors?: { [fieldName: string]: CLError[] };
}

class ShortFeedbackForm extends PureComponent<Props, State>{
  constructor(props) {
    super(props);
    this.state = {
      emailValue: '',
      feedbackValue: '',
    };
  }

  onChangeFeedback = (feedbackValue: string) => {
    this.setState(prev => ({ feedbackValue, apiErrors: omit(prev.apiErrors, 'message') }));
  }

  onChangeEmail = (emailValue: string) => {
    this.setState(prev => ({ emailValue, apiErrors: omit(prev.apiErrors, 'email') }));
  }

  validate = () => {
    return this.state.feedbackValue.length > 3;
  }

  onSubmit = () => {
    const { emailValue, feedbackValue } = this.state;
    if (this.validate) {
      postProductFeedback({
        question: 'found_what_youre_looking_for?',
        page: removeUrlLocale(location.pathname),
        locale: this.props.locale || undefined,
        answer: 'no',
        email: emailValue.length > 0 ? emailValue : null,
        message: feedbackValue
      })
      .then(() => this.props.closeModal())
      .catch(err => err && err.json && this.setState({ apiErrors: err.json.errors }));
    }
  }

  render() {
    const { emailValue, feedbackValue } = this.state;

    return (
      <Container>
        <form>
          <SectionTitle><FormattedMessage {...messages.feedbackModalTitle} /></SectionTitle>
          <SectionSubtitle><FormattedMessage {...messages.feedbackModalSubtitle} /></SectionSubtitle>

          <SectionField>
            <Label value={<FormattedMessage {...messages.feedback} />} />
            <TextArea
              autofocus={true}
              name="feedback"
              value={feedbackValue}
              onChange={this.onChangeFeedback}
            />
            {this.state.apiErrors && <Error apiErrors={this.state.apiErrors.message} />}
          </SectionField>

          <SectionField>
            <Label value={<FormattedMessage {...messages.email} />} />
            <Input
              type="text"
              value={emailValue}
              onChange={this.onChangeEmail}
            />
            {this.state.apiErrors && <Error apiErrors={this.state.apiErrors.email} />}
          </SectionField>

          <SectionField>
            <Button
              onClick={this.onSubmit}
              disabled={!this.validate()}
            >
              <FormattedMessage {...messages.submit} />
            </Button>
          </SectionField>
        </form>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale/>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ShortFeedbackForm {...inputProps} {...dataProps} />}
  </Data>
);
