import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString, isEmpty } from 'lodash';

// components
import TextArea from 'components/UI/TextArea';
import Label from 'components/UI/Label';
import Warning from 'components/UI/Warning';
import Radio from 'components/UI/Radio';
import Icon from 'components/UI/Icon';
import Toggle from 'components/UI/Toggle';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import InvitesTable from './all';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { listGroups, IGroups } from 'services/groups';
import { bulkInviteXLSX } from 'services/invites';

// i18n
import { FormattedHTMLMessage } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { appLocalePairs } from 'i18n.js';
import { getLocalized } from 'utils/i18n';

// utils
import { getBase64FromFile } from 'utils/imageTools';
import FileSaver from 'file-saver';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';

// styling
import styled from 'styled-components';

// typings
import { Locale, IOption } from 'typings';

const timeout = 350;

const FileInputWrapper = styled.div`
  margin-top: 15px;
  margin-bottom: 20px;
`;

const ArrowIcon = styled(Icon)`
  fill: ${(props) => props.theme.colors.label};
  height: 13px;
  margin-right: 9px;
  transition: transform 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
              fill 80ms ease-out;

  &.opened {
    transform: rotate(90deg);
  }
`;

const StyledLabel = styled(Label)`
  padding-bottom: 0px;
  transition: all 80ms ease-out;
  cursor: pointer;
`;

const Options: any = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  transition: all 80ms ease-out;
  cursor: pointer;

  &:hover {
    ${StyledLabel} {
      color: #000;
    }

    ${ArrowIcon} {
      fill: #000;
    }
  }
`;

const InvitationOptionsContainer = styled.div`
  width: 497px;
  position: relative;
  border-radius: 5px;
  border: solid 1px #ddd;
  background: #fff;
  z-index: 1;
  transition: opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &:not(.opened) {
    /* visibility: hidden; */
    /* height: 0; */
    /* opacity: 0; */

    display: none;
  }

  &.opened {
    /* visibility: visible; */
    /* height: auto; */
    /* opacity: 1; */

    display: block;
  }
`;

const InvitationOptionsInner = styled.div`
  padding: 20px;
  padding-bottom: 0px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-top: 30px;
`;

const Processing = styled.div`
  color: ${(props) => props.theme.colors.label};
  margin-left: 15px;
`;

const ViewButtons = styled.div`
  display: flex;
  margin-bottom: 40px;
`;

const ViewButton = styled.div`
  min-width: 85px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  border: solid 1px #e4e4e4;

  &:hover,
  &.active {
    background: #f0f0f0;
  }

  > span {
    color: ${(props) => props.theme.colors.label};
    color: #333;
    font-size: 17px;
    font-weight: 400;
    line-height: 24px;
    padding-left: 15px;
    padding-right: 15px;
  }
`;

const LeftButton = ViewButton.extend`
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const RightButton = ViewButton.extend`
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;

// const Bleh = styled.div``;

type Props = {};

type State = {
  currentTenantLocales: Locale[] | null;
  groupOptions: IOption[] | null;
  selectedEmails: string | null;
  selectedFileBase64: string | null;
  hasAdminRights: boolean;
  selectedLocale: Locale | null;
  selectedGroups: IOption[] | null;
  selectedInviteText: string | null;
  invitationOptionsOpened: boolean;
  selectedView: 'import' | 'text';
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
      selectedInviteText: null,
      invitationOptionsOpened: false,
      selectedView: 'import',
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

  handleInviteTextOnChange = (selectedInviteText: string) => {
    this.setState({ selectedInviteText });
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

  toggleOptions = () => {
    this.setState(state => ({ invitationOptionsOpened: !state.invitationOptionsOpened }));
  }

  selectView = (selectedView: 'import' | 'text') => () => {
    this.setState((state) => ({
      selectedView,
      selectedEmails: null,
      selectedFileBase64: null,
      hasAdminRights: false,
      selectedLocale: (state.currentTenantLocales ? state.currentTenantLocales[0] : null),
      selectedGroups: null,
      selectedInviteText: null,
      invitationOptionsOpened: false
    }));
  }

  downloadExampleFile = async (event) => {
    event.preventDefault();
    const blob = await requestBlob(`${API_PATH}/invites/example_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    FileSaver.saveAs(blob, 'bleh.xlsx');
  }

  handleOnSubmit = async () => {
    // currentTenantLocales: null,
    // groupOptions: null,
    // selectedEmails: null,
    // selectedFileBase64: null,
    // hasAdminRights: false,
    // selectedLocale: null,
    // selectedGroups: null,
    // selectedInviteText: null,
    // invitationOptionsOpened: false,
    // selectedView: 'import',
    // loaded: false,
    // dirty: false,
    // processing: false,
    // processed: false

    const { selectedLocale, selectedView, selectedEmails, selectedFileBase64, hasAdminRights, selectedGroups, selectedInviteText } = this.state;
    const hasCorrectSelection = ((selectedView === 'import' && isString(selectedFileBase64) && !selectedEmails) || (selectedView === 'text' && !selectedFileBase64 && isString(selectedEmails)));

    if (selectedLocale && hasCorrectSelection) {
      this.setState({ processing: true });

      await bulkInviteXLSX({
        xlsx: selectedFileBase64 as string,
        locale: selectedLocale,
        roles: (hasAdminRights ? [{ type: 'admin' }] : null),
        group_ids: (selectedGroups && selectedGroups.length > 0 ? selectedGroups.map(group => group.value) : null),
        invite_text: selectedInviteText
      });

      this.setState({ processing: false });
    }
  }

  render () {
    const { currentTenantLocales, groupOptions, selectedEmails, selectedFileBase64, hasAdminRights, selectedLocale, selectedGroups, selectedInviteText, invitationOptionsOpened, selectedView, loaded, processing, processed } = this.state;
    const dirty = ((isString(selectedEmails) && !isEmpty(selectedEmails)) || (isString(selectedFileBase64) && !isEmpty(selectedFileBase64)));

    const invitationOptions = (
      <>
        <Options onClick={this.toggleOptions}>
          <ArrowIcon name="chevron-right" className={`${invitationOptionsOpened && 'opened'}`} />
          <StyledLabel>
            <FormattedMessage {...messages.invitationOptions} />
          </StyledLabel>
        </Options>

        <InvitationOptionsContainer className={`${invitationOptionsOpened && 'opened'}`}>
          <InvitationOptionsInner>
            {selectedView === 'import' &&
              <SectionField>
                <Warning text={<FormattedHTMLMessage {...messages.importOptionsInfo} />} />
              </SectionField>
            }

            <SectionField>
              <Label>
                <FormattedMessage {...messages.adminLabel} />
              </Label>
              <Toggle value={hasAdminRights} onChange={this.handleAdminRightsOnToggle} />
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

            <SectionField>
              <Label>
                <FormattedMessage {...messages.inviteTextLabel} />
              </Label>
              <TextArea
                value={(selectedInviteText || '')}
                onChange={this.handleInviteTextOnChange}
              />
            </SectionField>
          </InvitationOptionsInner>
        </InvitationOptionsContainer>
      </>
    );

    if (currentTenantLocales && loaded) {
      return (
        <>
        <form onSubmit={this.handleOnSubmit}>
          <Section>
            <SectionTitle>
              <FormattedMessage {...messages.invitePeople} />
            </SectionTitle>

            <ViewButtons>
              <LeftButton onClick={this.selectView('import')} className={`${selectedView === 'import' && 'active'}`}>
                <FormattedMessage {...messages.importTab} />
              </LeftButton>
              <RightButton onClick={this.selectView('text')} className={`${selectedView === 'text' && 'active'}`}>
                <FormattedMessage {...messages.textTab} />
              </RightButton>
            </ViewButtons>

            {selectedView === 'import' &&
              <>
                <SectionField>
                  <Label>
                    <FormattedHTMLMessage {...messages.importLabel} />
                  </Label>

                  <Warning
                    text={
                      <FormattedMessage
                        {...messages.importInfo}
                        values={{
                          emailColumnName: <strong><FormattedMessage {...messages.emailColumnName} /></strong>, // tslint:disable-next-line
                          downloadLink: <a href="#" onClick={this.downloadExampleFile}><FormattedMessage {...messages.exampleFile} /></a>, // tslint:disable-next-line
                          supportPageLink: <a href="#"><FormattedMessage {...messages.supportPage} /></a>
                        }}
                      />
                    }
                  />

                  <FileInputWrapper>
                    <input
                      type="file"
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={this.handleFileInputOnChange}
                    />
                  </FileInputWrapper>
                </SectionField>

                {invitationOptions}
              </>
            }

            {selectedView === 'text' &&
              <>
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.emailListLabel} />
                  </Label>
                  <TextArea
                    value={(selectedEmails || '')}
                    onChange={this.handleEmailListOnChange}
                  />
                </SectionField>

                {invitationOptions}
              </>
            }

            <SectionField>
              <ButtonWrapper>
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
            </SectionField>
          </Section>
        </form>
        <InvitesTable />
        </>
      );
    }

    return null;
  }
}
