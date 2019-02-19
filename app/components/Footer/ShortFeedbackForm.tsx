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

interface Props {
  closeModal: () => void;
}

interface State {
  emailValue: string;
  feedbackValue: string;
}

export default class ShortFeedback extends PureComponent<Props, State>{
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
      trackEventByName(tracks.sendShortFeedbackForm.name, { extra: { feedbackValue, emailValue } });
    }
    this.props.closeModal();
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
