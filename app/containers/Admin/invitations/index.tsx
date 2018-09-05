import React from 'react';
import { isString, isEmpty, get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TextArea from 'components/UI/TextArea';
import Label from 'components/UI/Label';
import Warning from 'components/UI/Warning';
import Error from 'components/UI/Error';
import Radio from 'components/UI/Radio';
import Toggle from 'components/UI/Toggle';
import Collapse from 'components/admin/Collapse';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import InvitesTable from './all';
import HelmetIntl from 'components/HelmetIntl';

// services
import { bulkInviteXLSX, bulkInviteEmails, IInviteError, INewBulkInvite } from 'services/invites';

// resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// i18n
import { FormattedHTMLMessage } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { API_PATH, appLocalePairs } from 'containers/App/constants';
import { getLocalized } from 'utils/i18n';

// utils
import { getBase64FromFile } from 'utils/imageTools';
import { saveAs } from 'file-saver';
import { requestBlob } from 'utils/request';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

// typings
import { Locale, IOption } from 'typings';

const ViewButtons = styled.div`
  display: flex;
  margin-bottom: 40px;
`;

const ViewButton = styled.button`
  min-width: 85px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${colors.adminContentBackground};
  border: solid 1px ${colors.separation};

  &:hover,
  &:focus {
    background: ${rgba(colors.adminTextColor, .2)};
    outline: none;
  }
  &.active {
    background: ${rgba(colors.adminTextColor, .1)};
  }

  > span {
    color: ${colors.adminTextColor};
    font-size: ${fontSizes.medium}px;
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

const StyledToggle = styled(Toggle)`
  margin-bottom: 10px;
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

const SInvitesTable = styled(InvitesTable) `
  margin-top: 80px;
  margin-bottom: 80px;
`;

interface InputProps { }

interface DataProps {
  projects: GetProjectsChildProps;
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  groups: GetGroupsChildProps;
}

interface Props extends InputProps, DataProps { }

type State = {
  selectedEmails: string | null;
  selectedFileBase64: string | null;
  hasAdminRights: boolean;
  hasModeratorRights: boolean;
  selectedLocale: Locale | null;
  selectedProjects: IOption[] | null;
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
      hasModeratorRights: false,
      selectedLocale: null,
      selectedProjects: null,
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

  getProjectOptions = (projects: GetProjectsChildProps, locale: GetLocaleChildProps, tenantLocales: GetTenantLocalesChildProps) => {
    const { projectsList } = projects;

    if (!isNilOrError(locale) && !isNilOrError(tenantLocales) && !isNilOrError(projectsList) && projectsList.length > 0) {
      return projectsList.map((project) => ({
        value: project.id,
        label: getLocalized(project.attributes.title_multiloc, locale, tenantLocales)
      }));
    }

    return null;
  }

  getGroupOptions = (groups: GetGroupsChildProps, locale: GetLocaleChildProps, tenantLocales: GetTenantLocalesChildProps) => {
    if (!isNilOrError(locale) && !isNilOrError(tenantLocales) && !isNilOrError(groups.groupsList) && groups.groupsList.length > 0) {
      return groups.groupsList.map((group) => ({
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

  handleModeratorRightsOnToggle = () => {
    this.resetErrorAndSuccessState();
    this.setState(state => ({ hasModeratorRights: !state.hasModeratorRights }));
  }

  handleLocaleOnChange = (selectedLocale: Locale) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedLocale });
  }

  handleSelectedProjectsOnChange = (selectedProjects: IOption[]) => {
    this.resetErrorAndSuccessState();
    this.setState({ selectedProjects: (selectedProjects.length > 0 ? selectedProjects : null) });
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
      hasModeratorRights: false,
      selectedLocale: (this.props.tenantLocales ? this.props.tenantLocales[0] : null),
      selectedProjects: null,
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
    saveAs(blob, 'example.xlsx');
  }

  setFileInputRef = (ref: HTMLInputElement) => {
    this.fileInputElement = ref;
  }

  getRoles = () => {
    const {
      hasAdminRights,
      hasModeratorRights,
      selectedProjects
    } = this.state;

    const roles: INewBulkInvite['roles'] = [];

    if (hasAdminRights) {
      roles.push({ type: 'admin' });
    }

    if (hasModeratorRights && selectedProjects && selectedProjects.length > 0) {
      selectedProjects.forEach(project => {
        roles.push({ type: 'project_moderator', project_id: project.value });
      });
    }

    return roles;
  }

  handleOnSubmit = async (event) => {
    event.preventDefault();
    const {
      selectedLocale,
      selectedView,
      selectedEmails,
      selectedFileBase64,
      selectedGroups,
      selectedInviteText
    } = this.state;
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
          roles: this.getRoles(),
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
    const { projects, locale, tenantLocales, groups } = this.props;
    const {
      selectedEmails,
      selectedFileBase64,
      hasAdminRights,
      hasModeratorRights,
      selectedLocale,
      selectedProjects,
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
    const projectOptions = this.getProjectOptions(projects, locale, tenantLocales);
    const groupOptions = this.getGroupOptions(groups, locale, tenantLocales);
    const dirty = ((isString(selectedEmails) && !isEmpty(selectedEmails)) || (isString(selectedFileBase64) && !isEmpty(selectedFileBase64)));
    let supportPageURL = 'http://support.citizenlab.co/eng-getting-started/invite-people-to-the-platform';

    if (/^nl\-.*$/.test(locale || '')) {
      supportPageURL = 'http://support.citizenlab.co/nl-opstartgids/uitnodigingen-versturen';
    } else if (/^fr\-.*$/.test(locale || '')) {
      supportPageURL = 'http://support.citizenlab.co/fr-demarrez-avec-votre-plateforme/inviter-des-utilisateurs-sur-la-plate-forme';
    }

    const invitationOptions = (
      <Collapse
        opened={invitationOptionsOpened}
        onToggle={this.toggleOptions}
        label={<FormattedMessage {...messages.invitationOptions} />}
      >
        <>
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

          <SectionField>
            <Label>
              <FormattedMessage {...messages.moderatorLabel} />
            </Label>
            <StyledToggle value={hasModeratorRights} onChange={this.handleModeratorRightsOnToggle} />
            { hasModeratorRights &&
              <MultipleSelect
                value={selectedProjects}
                options={projectOptions}
                onChange={this.handleSelectedProjectsOnChange}
                placeholder={<FormattedMessage {...messages.projectSelectorPlaceholder} />}
              />
            }
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

        </>
      </Collapse>
    );

    return (
      <>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
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

        <SInvitesTable />
      </>
    );
  }
}

const Data = adopt<DataProps, {}>({
  projects: <GetProjects publicationStatuses={['draft', 'published', 'archived']} />,
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
  groups: <GetGroups membershipType="manual" />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <Invitations {...inputProps} {...dataProps} />}
  </Data>
);
