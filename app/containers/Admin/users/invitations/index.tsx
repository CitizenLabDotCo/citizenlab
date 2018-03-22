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

// services
import { currentTenantStream, ITenant } from 'services/tenant';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// i18n
import { appLocalePairs } from 'i18n.js';
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
  currentTenant: ITenant | null;
  emails: string | null;
  hasAdminRights: boolean;
  selectedLocale: Locale | null;
  loaded: boolean;
};

export default class Invitations extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      currentTenant: null,
      emails: null,
      hasAdminRights: false,
      selectedLocale: null,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({
          currentTenant,
          selectedLocale: (currentTenant ? currentTenant.data.attributes.settings.core.locales[0] : null),
          loaded: true
        });
      })
    ];
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
    this.setState(state => ({ hasAdminRights: !state.hasAdminRights }));
  }

  handleLocaleChange = (selectedLocale: Locale) => {
    this.setState({ selectedLocale });
  }

  render () {
    const { currentTenant, emails, selectedLocale, hasAdminRights, loaded } = this.state;

    if (currentTenant && loaded) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

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

          {currentTenantLocales && currentTenantLocales.length > 1 && selectedLocale &&
            <SectionField>
              <Label>
                <FormattedMessage {...messages.localeLabel} />
              </Label>

              {currentTenantLocales.map((currentTenantLocale) => (
                <Radio
                  key={currentTenantLocale}
                  onChange={this.handleLocaleChange}
                  currentValue={selectedLocale}
                  value={currentTenantLocale}
                  label={appLocalePairs[currentTenantLocale]}
                />
              ))}

              {/*
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
              */}
            </SectionField>
          }

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

    return null;
  }
}
