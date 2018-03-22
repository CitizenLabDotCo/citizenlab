import * as React from 'react';
import * as Rx from 'rxjs/Rx';
// import { get } from 'lodash';

// components
import TextArea from 'components/UI/TextArea';
import Toggle from 'components/UI/Toggle';
import Label from 'components/UI/Label';
import Radio from 'components/UI/Radio';
// import MultipleSelect from 'components/UI/MultipleSelect';
// import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// i18n
// import messages from './../messages';

// styling
import styled from 'styled-components';

// typings
import { Locale } from 'typings';

const Left = styled.div`

`;

const Middle = styled.div`

`;

const Right = styled.div`

`;

type Props = {};

type State = {
  emails: string | null;
  hasAdminRights: boolean;
  selectedLocale: Locale | null;
};

export default class Invitations extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      emails: null,
      hasAdminRights: false,
      selectedLocale: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmailListOnChange = () => {

  }

  handleFileInputOnChange = (event) => {
    console.log(event.target.files);
    // return event.target.files;
  }

  handleAdminRightsOnToggle = () => {

  }

  handleLocaleChange = () => {

  }

  render () {
    const { emails, hasAdminRights } = this.state;

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.invitePeople} />
        </SectionTitle>

        <SectionField>
          <Left>
            <Label>
              <FormattedMessage {...messages.emailListLabel} />
            </Label>
            <TextArea
              value={(emails || '')}
              onChange={this.handleEmailListOnChange}
            />
          </Left>

          <Middle>
            <FormattedMessage {...messages.or} />
          </Middle>

          <Right>
            <Label>
              <FormattedMessage {...messages.importLabel} />
            </Label>
            <input type="file" onChange={this.handleFileInputOnChange} />
          </Right>
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.adminLabel} />
          </Label>
          <Toggle checked={hasAdminRights} onToggle={this.handleAdminRightsOnToggle} />
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.localeLabel} />
          </Label>
          <Radio
            onChange={this.handleLocaleChange}
            currentValue={selectedLocale}
            value="draft"
            name="projectstatus"
            id="projecstatus-draft"
            label={<FormattedMessage {...messages.draftStatus} />}
          />
          <Radio
            onChange={this.handleLocaleChange}
            currentValue={selectedLocale}
            value="published"
            name="projectstatus"
            id="projecstatus-published"
            label={<FormattedMessage {...messages.publishedStatus} />}
          />
        </SectionField>

        {/*
        <SubmitWrapper
          loading={this.state.loading}
          status={getSubmitState({ errors, saved, diff: attributesDiff })}
          messages={{
            buttonSave: messages.save,
            buttonError: messages.saveError,
            buttonSuccess: messages.saveSuccess,
            messageError: messages.saveErrorMessage,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />
        */}
      </Section>
    );
  }
}
