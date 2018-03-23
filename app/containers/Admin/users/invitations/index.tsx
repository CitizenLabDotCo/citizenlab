import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString, isEmpty } from 'lodash';

// components
import TextArea from 'components/UI/TextArea';
import Toggle from 'components/UI/Toggle';
import Label from 'components/UI/Label';
import Warning from 'components/UI/Warning';
import Radio from 'components/UI/Radio';
// import Button from 'components/UI/Button';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { listGroups, IGroups } from 'services/groups';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { appLocalePairs } from 'i18n.js';
import { getLocalized } from 'utils/i18n';
// import messages from './../messages';

// utils
import { getBase64FromFile } from 'utils/imageTools';
// import getSubmitState from 'utils/getSubmitState';

// styling
import styled from 'styled-components';

// typings
import { Locale, IOption } from 'typings';

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  display: flex;
  justify-content: space-between;
`;

const Left = styled.div`
  width: 500px;
  flex: 0 0 500px;
`;

const Middle = styled.div`
  margin-left: 60px;
  margin-right: 60px;
  color: #333;
  font-weight: 600;
`;

const Right = styled.div`
  width: 100%;
`;

const FileInputWrapper = styled.div`
  margin-top: 30px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Processing = styled.div`
  color: ${(props) => props.theme.colors.label};
  margin-left: 15px;
`;

type Props = {};

type State = {
  currentTenantLocales: Locale[] | null;
  groupOptions: IOption[] | null;
  selectedEmails: string | null;
  selectedFileBase64: string | null;
  hasAdminRights: boolean;
  selectedLocale: Locale | null;
  selectedGroups: IOption[] | null;
  loaded: boolean;
  dirty: boolean;
  processing: boolean;
  processed: boolean;
};

export default class Invitations extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      currentTenantLocales: null,
      groupOptions: null,
      selectedEmails: null,
      selectedFileBase64: null,
      hasAdminRights: false,
      selectedLocale: null,
      selectedGroups: null,
      loaded: false,
      dirty: false,
      processing: false,
      processed: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
    const groups$ = listGroups().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$,
        groups$
      ).subscribe(([locale, currentTenantLocales, groups]) => {
        this.setState({
          currentTenantLocales,
          groupOptions: this.getGroupOptions(groups, locale, currentTenantLocales),
          selectedLocale: currentTenantLocales[0],
          loaded: true
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getGroupOptions = (groups: IGroups | null, locale: Locale, currentTenantLocales: Locale[]) => {
    if (groups && groups.data && groups.data.length > 0) {
      return groups.data.map((group) => ({
        value: group.id,
        label: getLocalized(group.attributes.title_multiloc, locale, currentTenantLocales)
      }));
    }

    return null;
  }

  handleEmailListOnChange = (selectedEmails: string) => {
    this.setState({ selectedEmails });
  }

  handleFileInputOnChange = async (event) => {
    const selectedFile: File | null = (event.target.files && event.target.files.length === 1 ? event.target.files['0'] : null);
    const selectedFileBase64 = (selectedFile ? await getBase64FromFile(selectedFile) : null);
    this.setState({ selectedFileBase64 });
  }

  handleAdminRightsOnToggle = () => {
    this.setState(state => ({ hasAdminRights: !state.hasAdminRights }));
  }

  handleLocaleOnChange = (selectedLocale: Locale) => {
    this.setState({ selectedLocale });
  }

  handleSelectedGroupsOnChange = (selectedGroups: IOption[]) => {
    this.setState({ selectedGroups: (selectedGroups.length > 0 ? selectedGroups : null) });
  }

  handleOnSubmit = () => {
    // const { selectedLocale } = this.state;

    // if (selectedLocale) {

    // }

    this.setState({ processing: true });
  }

  getSubmitState = (errors: object | null, processed: boolean, dirty: boolean) => {
    if (errors && !isEmpty(errors)) {
      return 'error';
    } else if (processed && !dirty) {
      return 'success';
    } else if (!dirty) {
      return 'disabled';
    }

    return 'enabled';
  }

  render () {
    const { currentTenantLocales, groupOptions, selectedEmails, selectedFileBase64, hasAdminRights, selectedLocale, selectedGroups, loaded, processing, processed } = this.state;
    const dirty = ((isString(selectedEmails) && !isEmpty(selectedEmails)) || (isString(selectedFileBase64) && !isEmpty(selectedFileBase64)));

    if (currentTenantLocales && loaded) {
      return (
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.invitePeople} />
          </SectionTitle>

          <StyledSectionField>
            <Left>
              <Label>
                <FormattedMessage {...messages.emailListLabel} />
              </Label>
              <TextArea
                value={(selectedEmails || '')}
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

              <Warning text={<FormattedMessage {...messages.importInfo} />} />

              <FileInputWrapper>
                <input
                  type="file"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={this.handleFileInputOnChange}
                />
              </FileInputWrapper>
            </Right>
          </StyledSectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.adminLabel} />
            </Label>
            <Toggle checked={hasAdminRights} onToggle={this.handleAdminRightsOnToggle} />
          </SectionField>

          {currentTenantLocales && currentTenantLocales.length > 1 &&
            <SectionField>
              <Label>
                <FormattedMessage {...messages.localeLabel} />
              </Label>

              {currentTenantLocales.map((currentTenantLocale) => (
                <Radio
                  key={currentTenantLocale}
                  onChange={this.handleLocaleOnChange}
                  currentValue={selectedLocale}
                  value={currentTenantLocale}
                  label={appLocalePairs[currentTenantLocale]}
                />
              ))}
            </SectionField>
          }

          <SectionField>
            <Label>
              <FormattedMessage {...messages.groupsLabel} />
            </Label>
            <MultipleSelect
              value={selectedGroups}
              options={groupOptions}
              onChange={this.handleSelectedGroupsOnChange}
              placeholder={<FormattedMessage {...messages.groupsPlaceholder} />}
            />
          </SectionField>

          <ButtonWrapper>
            {/*
            <Button processing={processing} onClick={this.handleOnSubmit} circularCorners={true}>
              <FormattedMessage {...messages.sendOutInvitations} />
            </Button>
            */}

            <SubmitWrapper
              loading={processing}
              status={this.getSubmitState(null, processed, dirty)}
              messages={{
                buttonSave: messages.save,
                buttonError: messages.saveError,
                buttonSuccess: messages.saveSuccess,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />

            {processing &&
              <Processing>
                <FormattedMessage {...messages.processing} />
              </Processing>
            }
          </ButtonWrapper>

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
