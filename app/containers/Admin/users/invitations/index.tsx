import React from 'react';
import { isString, isEmpty, get } from 'lodash';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TextArea from 'components/UI/TextArea';
import Label from 'components/UI/Label';
import Warning from 'components/UI/Warning';
import Error from 'components/UI/Error';
import Radio from 'components/UI/Radio';
import Icon from 'components/UI/Icon';
import Toggle from 'components/UI/Toggle';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import InvitesTable from './all';

// services
import { bulkInviteXLSX, bulkInviteEmails, IInviteError, INewBulkInvite } from 'services/invites';

// resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

// i18n
import { FormattedHTMLMessage } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { appLocalePairs } from 'i18n';
import { getLocalized } from 'utils/i18n';

// utils
import { getBase64FromFile } from 'utils/imageTools';
import FileSaver from 'file-saver';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';

// styling
import styled from 'styled-components';

// typings
import { Locale, IOption } from 'typings';

const timeout = 400;

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

const FileInputWrapper = styled.div`
  margin-top: 15px;
  margin-bottom: 20px;
`;

const ArrowIcon = styled(Icon)`
  fill: ${(props) => props.theme.colors.label};
  height: 11px;
  margin-right: 8px;
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
  display: inline-flex;
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
  opacity: 0;
  display: none;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: opacity, height;

  &.options-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.options-enter-active {
      opacity: 1;
      max-height: 500px;
      overflow: hidden;
      display: block;
    }
  }

  &.options-enter-done {
    opacity: 1;
    overflow: visible;
    display: block;
  }

  &.options-exit {
    opacity: 1;
    max-height: 500px;
    overflow: hidden;
    display: block;

    &.options-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.options-exit-done {
    display: none;
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

const Invites = styled.div`
  margin-top: 100px;
`;

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  groups: GetGroupsChildProps;
}

interface Props extends InputProps, DataProps {}

type State = {
  selectedEmails: string | null;
  selectedFileBase64: string | null;
  hasAdminRights: boolean;
  selectedLocale: Locale | null;
  selectedGroups: IOption[] | null;
  selectedInviteText: string | null;
  invitationOptionsOpened: boolean;
  selectedView: 'import' | 'text';
  dirty: boolean;
  processing: boolean;
  processed: boolean;
  apiErrors: IInviteError[] | null;
  filetypeError: JSX.Element | null;
  unknownError: JSX.Element | null;
};

class Invitations extends React.PureComponent<Props, State> {
  fileInputElement: HTMLInputElement | null;

  constructor(props) {
    super(props);
    this.state = {
      selectedEmails: null,
      selectedFileBase64: null,
      hasAdminRights: false,
      selectedLocale: null,
      selectedGroups: null,
      selectedInviteText: null,
      invitationOptionsOpened: false,
      selectedView: 'import',
      dirty: false,
      processing: false,
      processed: false,
      apiErrors: null,
      filetypeError: null,
      unknownError: null
    };
    this.fileInputElement = null;
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.tenantLocales && !prevState.selectedLocale) {
      return {
        selectedLocale: nextProps.tenantLocales[0]
      };
    }

    return null;
  }

  getGroupOptions = (groups: GetGroupsChildProps, locale: GetLocaleChildProps, tenantLocales: GetTenantLocalesChildProps) => {
    if (!isNilOrError(locale) && !isNilOrError(tenantLocales) && !isNilOrError(groups) && groups.length > 0) {
      return groups.map((group) => ({
        value: group.id,
        label: getLocalized(group.attributes.title_multiloc, locale, tenantLocales)
      }));
    }

    return null;
  }

  resetErrorAndSuccessState() {
    this.setState({ processed: false, apiErrors: null, unknownError: null });
  }

  handleEmailListOnChange = (selectedEmails: string) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedEmails });
  }

  handleFileInputOnChange = async (event) => {
    let selectedFile: File | null = (event.target.files && event.target.files.length === 1 ? event.target.files['0'] : null);
    let filetypeError: JSX.Element | null = null;

    if (selectedFile && selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      filetypeError = <FormattedMessage {...messages.filetypeError} />;
      selectedFile = null;

      if (this.fileInputElement) {
        this.fileInputElement.value = '';
      }
    }

    const selectedFileBase64 = (selectedFile ? await getBase64FromFile(selectedFile) : null);
    this.resetErrorAndSuccessState();
    this.setState({ selectedFileBase64, filetypeError });
  }

  handleAdminRightsOnToggle = () => {
    this.resetErrorAndSuccessState();
    this.setState(state => ({ hasAdminRights: !state.hasAdminRights }));
  }

  handleLocaleOnChange = (selectedLocale: Locale) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedLocale });
  }

  handleSelectedGroupsOnChange = (selectedGroups: IOption[]) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedGroups: (selectedGroups.length > 0 ? selectedGroups : null) });
  }

  handleInviteTextOnChange = (selectedInviteText: string) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedInviteText });
  }

  getSubmitState = (errors: IInviteError[] | null, processed: boolean, dirty: boolean) => {
    if (errors && errors.length > 0) {
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

  resetWithView = (selectedView: 'import' | 'text') => () => {
    this.setState({
      selectedView,
      selectedEmails: null,
      selectedFileBase64: null,
      hasAdminRights: false,
      selectedLocale: (this.props.tenantLocales ? this.props.tenantLocales [0] : null),
      selectedGroups: null,
      selectedInviteText: null,
      invitationOptionsOpened: false,
      processed: false,
      dirty: false,
      apiErrors: null,
      filetypeError: null,
      unknownError: null
    });
  }

  downloadExampleFile = async (event) => {
    event.preventDefault();
    const blob = await requestBlob(`${API_PATH}/invites/example_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    FileSaver.saveAs(blob, 'example.xlsx');
  }

  setFileInputRef = (ref: HTMLInputElement) => {
    this.fileInputElement = ref;
  }

  handleOnSubmit = async (event) => {
    event.preventDefault();

    const { selectedLocale, selectedView, selectedEmails, selectedFileBase64, hasAdminRights, selectedGroups, selectedInviteText } = this.state;
    const hasCorrectSelection = ((selectedView === 'import' && isString(selectedFileBase64) && !selectedEmails) || (selectedView === 'text' && !selectedFileBase64 && isString(selectedEmails)));

    if (selectedLocale && hasCorrectSelection) {
      try {
        this.setState({
          processing: true,
          processed: false,
          apiErrors: null,
          filetypeError: null,
          unknownError: null
        });

        const bulkInvite: INewBulkInvite = {
          locale: selectedLocale,
          roles: (hasAdminRights ? [{ type: 'admin' }] : null),
          group_ids: (selectedGroups && selectedGroups.length > 0 ? selectedGroups.map(group => group.value) : null),
          invite_text: selectedInviteText
        };

        if (selectedView === 'import' && isString(selectedFileBase64)) {
          await bulkInviteXLSX({
            xlsx: selectedFileBase64,
            ...bulkInvite
          });
        }

        if (selectedView === 'text' && isString(selectedEmails)) {
          await bulkInviteEmails({
            emails: selectedEmails.split(',').map(item => item.trim()),
            ...bulkInvite
          });
        }

        // reset file input
        if (this.fileInputElement) {
          this.fileInputElement.value = '';
        }

        // reset state
        this.setState({
          processing: false,
          processed: true,
          dirty: false,
          selectedEmails: null,
          selectedFileBase64: null
        });
      } catch (errors) {
        const apiErrors = get(errors, 'json.errors', null);

        this.setState({
          apiErrors,
          unknownError: (!apiErrors ? <FormattedMessage {...messages.unknownError} /> : null),
          processing: false
        });
      }
    }
  }

  render () {
    const { locale, tenantLocales, groups } = this.props;
    const {
      selectedEmails,
      selectedFileBase64,
      hasAdminRights,
      selectedLocale,
      selectedGroups,
      selectedInviteText,
      invitationOptionsOpened,
      selectedView,
      processing,
      processed,
      apiErrors,
      filetypeError,
      unknownError
    } = this.state;
    const groupOptions = this.getGroupOptions(groups, locale, tenantLocales);
    const dirty = ((isString(selectedEmails) && !isEmpty(selectedEmails)) || (isString(selectedFileBase64) && !isEmpty(selectedFileBase64)));
    let supportPageURL = 'http://support.citizenlab.co/eng-getting-started/invite-people-to-the-platform';

    if (/^nl\-.*$/.test(locale || '')) {
      supportPageURL = 'http://support.citizenlab.co/nl-opstartgids/uitnodigingen-versturen';
    } else if (/^fr\-.*$/.test(locale || '')) {
      supportPageURL = 'http://support.citizenlab.co/fr-demarrez-avec-votre-plateforme/inviter-des-utilisateurs-sur-la-plate-forme';
    }

    const invitationOptions = (
      <>
        <Options onClick={this.toggleOptions}>
          <ArrowIcon name="chevron-right" className={`${invitationOptionsOpened && 'opened'}`} />
          <StyledLabel>
            <FormattedMessage {...messages.invitationOptions} />
          </StyledLabel>
        </Options>

        <CSSTransition
          classNames="options"
          in={invitationOptionsOpened}
          timeout={timeout}
          mounOnEnter={false}
          unmountOnExit={false}
          enter={true}
          exit={true}
        >
          <InvitationOptionsContainer>
            <InvitationOptionsInner>
              {selectedView === 'import' &&
                <SectionField>
                  <Warning
                    text={
                      <FormattedMessage
                        {...messages.importOptionsInfo}
                        values={{
                          // tslint:disable-next-line
                          supportPageLink: <a href={supportPageURL} target="_blank"><FormattedMessage {...messages.supportPage} /></a>
                        }}
                      />
                    }
                  />
                </SectionField>
              }

              <SectionField>
                <Label>
                  <FormattedMessage {...messages.adminLabel} />
                </Label>
                <Toggle value={hasAdminRights} onChange={this.handleAdminRightsOnToggle} />
              </SectionField>

              {!isNilOrError(tenantLocales) && tenantLocales.length > 1 &&
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.localeLabel} />
                  </Label>

                  {tenantLocales.map((currentTenantLocale) => (
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
        </CSSTransition>
      </>
    );

    return (
      <>
        <form onSubmit={this.handleOnSubmit} id="e2e-invitations">
          <Section>
            <SectionTitle>
              <FormattedMessage {...messages.invitePeople} />
            </SectionTitle>

            <ViewButtons>
              <LeftButton onClick={this.resetWithView('import')} className={`${selectedView === 'import' && 'active'}`}>
                <FormattedMessage {...messages.importTab} />
              </LeftButton>
              <RightButton onClick={this.resetWithView('text')} className={`${selectedView === 'text' && 'active'} e2e-manual-invite`}>
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
                          supportPageLink: <a href={supportPageURL} target="_blank"><FormattedMessage {...messages.supportPage} /></a>
                        }}
                      />
                    }
                  />

                  <FileInputWrapper>
                    <input
                      type="file"
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={this.handleFileInputOnChange}
                      ref={this.setFileInputRef}
                    />
                  </FileInputWrapper>
                  <Error text={filetypeError} />
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
                    id="e2e-emails"
                  />
                </SectionField>

                {invitationOptions}
              </>
            }

            <SectionField>
              <ButtonWrapper>
                <SubmitWrapper
                  loading={processing}
                  status={this.getSubmitState(apiErrors, processed, dirty)}
                  messages={{
                    buttonSave: messages.save,
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

              <Error
                apiErrors={apiErrors}
                showIcon={true}
                marginTop="15px"
                animate={false}
              />

              <Error text={unknownError} />
            </SectionField>
          </Section>
        </form>

        <Invites>
          <InvitesTable />
        </Invites>
      </>
    );
  }
}

const Data = adopt<DataProps, {}>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
  groups: <GetGroups />
});

export default (inputProps: InputProps) => <Data>{dataProps => <Invitations {...inputProps} {...dataProps} />}</Data>;
