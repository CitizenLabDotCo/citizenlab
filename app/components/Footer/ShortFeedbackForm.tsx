// libraries
import React, { PureComponent } from 'react';

// translations
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import Input from 'components/UI/Input';
import { SectionTitle, SectionSubtitle, SectionField } from 'components/admin/Section';
import Label from 'components/UI/Label';
import TextArea from 'components/UI/TextArea';
import Button from 'components/UI/Button';
import { adopt } from 'react-adopt';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { postProductFeedback } from 'services/productFeedback';
import { removeUrlLocale } from 'services/locale';

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
}

class ShortFeedbackForm extends PureComponent<Props, State>{
  constructor(props) {
    super(props);
    this.state = {
      emailValue: '',
      feedbackValue: ''
    };
  }

  onChangeFeedback = (feedbackValue: string) => {
    this.setState({ feedbackValue });
  }

  onChangeEmail = (emailValue: string) => {
    this.setState({ emailValue });
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
      .catch(err => console.log(err));
    }
  }

  render() {
    const { emailValue, feedbackValue } = this.state;

    return (
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
        </SectionField>

        <SectionField>
          <Label value={<FormattedMessage {...messages.email} />} />
          <Input
            type="text"
            value={emailValue}
            onChange={this.onChangeEmail}
          />
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
