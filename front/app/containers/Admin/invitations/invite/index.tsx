import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { isString, isEmpty, get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TextArea from 'components/UI/TextArea';
import Error from 'components/UI/Error';
import {
  Radio,
  IconTooltip,
  Toggle,
  Label,
  Box,
  Text,
} from '@citizenlab/cl2-component-library';
import Tabs from 'components/UI/Tabs';
import Collapse from 'components/UI/Collapse';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import QuillEditor from 'components/UI/QuillEditor';
import HelmetIntl from 'components/HelmetIntl';
import Button from 'components/UI/Button';
import Warning from 'components/UI/Warning';
const InviteUsersWithSeatsModal = lazy(
  () => import('components/admin/InviteUsersWithSeatsModal')
);
import SeatInfo from 'components/SeatInfo';
import useFeatureFlag from 'hooks/useFeatureFlag';

// services
import {
  bulkInviteXLSX,
  bulkInviteEmails,
  bulkInviteCountNewSeatsXLSX,
  bulkInviteCountNewSeatsEmails,
  IInviteError,
  INewBulkInvite,
  IInvitesNewSeats,
} from 'services/invites';

// resources
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { API_PATH, appLocalePairs } from 'containers/App/constants';
import { getLocalized } from 'utils/i18n';

// utils
import { getBase64FromFile } from 'utils/fileUtils';
import { saveAs } from 'file-saver';
import { requestBlob } from 'utils/request';

// styling
import styled from 'styled-components';
import { colors, fontSizes, stylingConsts } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { Locale, IOption } from 'typings';
import { useExceedsSeats } from 'hooks/useExceedsSeats';

const StyledTabs = styled(Tabs)`
  margin-bottom: 35px;
`;

const StyledToggle = styled(Toggle)`
  margin-bottom: 10px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 15px;
  font-size: ${fontSizes.l}px;
  font-weight: bold;
`;

const SectionParagraph = styled.p`
  a {
    color: ${colors.teal};
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.teal)};
      text-decoration: underline;
    }
  }
`;

const DownloadButton = styled(Button)`
  margin-bottom: 15px;
`;

const StyledWarning = styled(Warning)`
  margin-top: 5px;
`;

export interface InputProps {}

interface DataProps {
  projects: GetProjectsChildProps;
  locale: GetLocaleChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
  groups: GetGroupsChildProps;
}

interface Props extends InputProps, DataProps {}

const Invitations = ({ projects, locale, tenantLocales, groups }: Props) => {
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  const [selectedEmails, setSelectedEmails] = useState<string | null>(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(
    null
  );
  const [inviteesWillHaveAdminRights, setInviteesWillHaveAdminRights] =
    useState<boolean>(false);
  const [inviteesWillHaveModeratorRights, setInviteesWillHaveModeratorRights] =
    useState<boolean>(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<IOption[] | null>(
    null
  );
  const [selectedGroups, setSelectedGroups] = useState<IOption[] | null>(null);
  const [selectedInviteText, setSelectedInviteText] = useState<string | null>(
    null
  );
  const [invitationOptionsOpened, setInvitationOptionsOpened] =
    useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'import' | 'text'>('import');
  const [processing, setProcessing] = useState<boolean>(false);
  const [processed, setProcessed] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<IInviteError[] | null>(null);
  const [filetypeError, setFiletypeError] = useState<JSX.Element | null>(null);
  const [unknownError, setUnknownError] = useState<JSX.Element | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newSeatsResponse, setNewSeatsResponse] =
    useState<IInvitesNewSeats | null>(null);

  const exceedsSeats = useExceedsSeats();

  const closeModal = () => {
    setShowModal(false);
    setProcessing(false);
  };

  const fileInputElement = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (tenantLocales && !selectedLocale) {
      setSelectedLocale(tenantLocales[0]);
    }
  }, [tenantLocales, selectedLocale]);

  const getProjectOptions = (
    projects: GetProjectsChildProps,
    locale: GetLocaleChildProps,
    tenantLocales: GetAppConfigurationLocalesChildProps
  ) => {
    const { projectsList } = projects;

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      !isNilOrError(projectsList) &&
      projectsList.length > 0
    ) {
      return projectsList.map((project) => ({
        value: project.id,
        label: getLocalized(
          project.attributes.title_multiloc,
          locale,
          tenantLocales
        ),
      }));
    }

    return null;
  };

  const getGroupOptions = (
    groups: GetGroupsChildProps,
    locale: GetLocaleChildProps,
    tenantLocales: GetAppConfigurationLocalesChildProps
  ) => {
    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      !isNilOrError(groups.groupsList) &&
      groups.groupsList.length > 0
    ) {
      return groups.groupsList.map((group) => ({
        value: group.id,
        label: getLocalized(
          group.attributes.title_multiloc,
          locale,
          tenantLocales
        ),
      }));
    }

    return null;
  };

  const resetErrorAndSuccessState = () => {
    setProcessed(false);
    setApiErrors(null);
    setUnknownError(null);
  };

  const handleEmailListOnChange = (selectedEmails: string) => {
    resetErrorAndSuccessState();
    setSelectedEmails(selectedEmails);
  };

  const handleFileInputOnChange = async (event) => {
    let selectedFile: File | null =
      event.target.files && event.target.files.length === 1
        ? event.target.files['0']
        : null;
    let filetypeError: JSX.Element | null = null;

    if (
      selectedFile &&
      selectedFile.type !==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      filetypeError = <FormattedMessage {...messages.filetypeError} />;
      selectedFile = null;

      if (fileInputElement.current) {
        fileInputElement.current.value = '';
      }
    }

    const selectedFileBase64 = selectedFile
      ? await getBase64FromFile(selectedFile)
      : null;
    resetErrorAndSuccessState();
    setSelectedFileBase64(selectedFileBase64);
    setFiletypeError(filetypeError);
  };

  const handleAdminRightsOnToggle = () => {
    resetErrorAndSuccessState();
    setInviteesWillHaveAdminRights(!inviteesWillHaveAdminRights);
  };

  const handleModeratorRightsOnToggle = () => {
    resetErrorAndSuccessState();
    setInviteesWillHaveModeratorRights(!inviteesWillHaveModeratorRights);
  };

  const handleLocaleOnChange = (selectedLocale: Locale) => {
    resetErrorAndSuccessState();
    setSelectedLocale(selectedLocale);
  };

  const handleSelectedProjectsOnChange = (selectedProjects: IOption[]) => {
    resetErrorAndSuccessState();
    setSelectedProjects(selectedProjects.length > 0 ? selectedProjects : null);
  };

  const handleSelectedGroupsOnChange = (selectedGroups: IOption[]) => {
    resetErrorAndSuccessState();
    setSelectedGroups(selectedGroups.length > 0 ? selectedGroups : null);
  };

  const handleInviteTextOnChange = (selectedInviteText: string) => {
    resetErrorAndSuccessState();
    setSelectedInviteText(selectedInviteText);
  };

  const getSubmitState = (
    errors: IInviteError[] | null,
    processed: boolean
  ) => {
    const isInvitationValid = validateInvitation();
    if (errors && errors.length > 0) {
      return 'error';
    } else if (processed && !isInvitationValid) {
      return 'success';
    } else if (!isInvitationValid) {
      return 'disabled';
    }
    return 'enabled';
  };

  const toggleOptions = () => {
    setInvitationOptionsOpened(!invitationOptionsOpened);
  };

  const resetWithView = (selectedView: 'import' | 'text') => {
    setSelectedView(selectedView);
    setSelectedEmails(null);
    setSelectedFileBase64(null);
    setInviteesWillHaveAdminRights(false);
    setInviteesWillHaveModeratorRights(false);
    setSelectedLocale(tenantLocales ? tenantLocales[0] : null);
    setSelectedProjects(null);
    setSelectedGroups(null);
    setSelectedInviteText(null);
    setInvitationOptionsOpened(false);
    setProcessed(false);
    setApiErrors(null);
    setFiletypeError(null);
    setUnknownError(null);
  };

  const downloadExampleFile = async (
    event: React.MouseEvent<Element, MouseEvent>
  ) => {
    event.preventDefault();
    const blob = await requestBlob(
      `${API_PATH}/invites/example_xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  const getRoles = () => {
    const roles: INewBulkInvite['roles'] = [];

    if (inviteesWillHaveAdminRights) {
      roles.push({ type: 'admin' });
    }

    if (
      inviteesWillHaveModeratorRights &&
      selectedProjects &&
      selectedProjects.length > 0
    ) {
      selectedProjects.forEach((project) => {
        roles.push({ type: 'project_moderator', project_id: project.value });
      });
    }

    return roles;
  };

  const checkNewSeatsResponse = (newSeatsResponse: IInvitesNewSeats) => {
    setNewSeatsResponse(newSeatsResponse);
    const {
      newly_added_admins_number: newlyAddedAdminsNumber,
      newly_added_moderators_number: newlyAddedModeratorsNumber,
    } = newSeatsResponse.data.attributes;
    if (
      exceedsSeats({
        newlyAddedAdminsNumber,
        newlyAddedModeratorsNumber,
      }).any
    ) {
      setShowModal(true);
    } else {
      onSubmit({ save: true });
    }
  };

  // `save` parameter is used to avoid duplication of import/text and error handling logic
  const onSubmit = async ({ save }: { save: boolean }) => {
    const hasCorrectSelection =
      (selectedView === 'import' &&
        isString(selectedFileBase64) &&
        !selectedEmails) ||
      (selectedView === 'text' &&
        !selectedFileBase64 &&
        isString(selectedEmails));

    if (selectedLocale && hasCorrectSelection) {
      try {
        setProcessing(true);
        setProcessed(false);
        setApiErrors(null);
        setFiletypeError(null);
        setUnknownError(null);

        const bulkInvite: INewBulkInvite = {
          locale: selectedLocale,
          roles: getRoles(),
          group_ids:
            selectedGroups && selectedGroups.length > 0
              ? selectedGroups.map((group) => group.value)
              : null,
          invite_text: selectedInviteText,
        };

        if (selectedView === 'import' && isString(selectedFileBase64)) {
          const inviteOptions = {
            xlsx: selectedFileBase64,
            ...bulkInvite,
          };
          if (save) {
            await bulkInviteXLSX(inviteOptions);
          } else {
            const newSeats = await bulkInviteCountNewSeatsXLSX(inviteOptions);
            checkNewSeatsResponse(newSeats);
          }
        }

        if (selectedView === 'text' && isString(selectedEmails)) {
          const inviteOptions = {
            emails: selectedEmails.split(',').map((item) => item.trim()),
            ...bulkInvite,
          };
          if (save) {
            await bulkInviteEmails(inviteOptions);
          } else {
            const newSeats = await bulkInviteCountNewSeatsEmails(inviteOptions);
            checkNewSeatsResponse(newSeats);
          }
        }

        if (save) {
          // reset file input
          if (fileInputElement.current) {
            fileInputElement.current.value = '';
          }

          // reset state
          setProcessing(false);
          setProcessed(true);
          setSelectedEmails(null);
          setSelectedFileBase64(null);
        }
      } catch (errors) {
        const apiErrors = get(errors, 'json.errors', null);

        setApiErrors(apiErrors);
        setUnknownError(
          !apiErrors ? <FormattedMessage {...messages.unknownError} /> : null
        );
        setProcessing(false);
      }
    }
  };

  const validateInvitation = () => {
    const isValidEmails = isString(selectedEmails) && !isEmpty(selectedEmails);
    const hasValidRights = inviteesWillHaveModeratorRights
      ? !isEmpty(selectedProjects)
      : true;
    const isValidInvitationTemplate =
      isString(selectedFileBase64) && !isEmpty(selectedFileBase64);
    return (isValidEmails || isValidInvitationTemplate) && hasValidRights;
  };

  const handleSubmitAction = (event: React.FormEvent) => {
    event.preventDefault();

    if (hasSeatBasedBillingEnabled) {
      onSubmit({ save: false });
    } else {
      onSubmit({ save: true });
    }
  };

  const projectOptions = getProjectOptions(projects, locale, tenantLocales);
  const groupOptions = getGroupOptions(groups, locale, tenantLocales);

  const invitationTabs = [
    {
      name: 'import',
      label: formatMessage(messages.importTab),
    },
    {
      name: 'text',
      label: formatMessage(messages.textTab),
    },
  ];

  const invitationOptions = (
    <Collapse
      opened={invitationOptionsOpened}
      onToggle={toggleOptions}
      label={<FormattedMessage {...messages.invitationOptions} />}
      labelTooltipText={
        selectedView === 'import' ? (
          <FormattedMessage
            {...messages.importOptionsInfo}
            values={{
              supportPageLink: (
                <a
                  href={formatMessage(messages.invitesSupportPageURL)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage {...messages.supportPage} />
                </a>
              ),
            }}
          />
        ) : null
      }
    >
      <Box
        width="497px"
        padding="20px"
        borderRadius={stylingConsts.borderRadius}
        border="solid 1px #ddd"
        background={colors.white}
      >
        <SectionField>
          <Box display="flex" justifyContent="space-between">
            <Label>
              <FormattedMessage {...messages.adminLabel} />
              <IconTooltip
                content={<FormattedMessage {...messages.adminLabelTooltip} />}
              />
            </Label>
            <Toggle
              checked={inviteesWillHaveAdminRights}
              onChange={handleAdminRightsOnToggle}
            />
          </Box>
          {!hasSeatBasedBillingEnabled && inviteesWillHaveAdminRights && (
            <Box marginTop="20px">
              <SeatInfo seatType="admin" />
            </Box>
          )}
        </SectionField>

        <SectionField>
          <Box display="flex" justifyContent="space-between">
            <Label>
              <FormattedMessage {...messages.moderatorLabel} />
              <IconTooltip
                content={
                  <FormattedMessage
                    {...messages.moderatorLabelTooltip}
                    values={{
                      moderatorLabelTooltipLink: (
                        <a
                          href={formatMessage(
                            messages.moderatorLabelTooltipLink
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FormattedMessage
                            {...messages.moderatorLabelTooltipLinkText}
                          />
                        </a>
                      ),
                    }}
                  />
                }
              />
            </Label>
            <StyledToggle
              checked={inviteesWillHaveModeratorRights}
              onChange={handleModeratorRightsOnToggle}
            />
          </Box>

          {inviteesWillHaveModeratorRights && (
            <>
              <MultipleSelect
                value={selectedProjects}
                options={projectOptions}
                onChange={handleSelectedProjectsOnChange}
                placeholder={
                  <FormattedMessage {...messages.projectSelectorPlaceholder} />
                }
              />
              {isNilOrError(selectedProjects) && (
                <StyledWarning>
                  <FormattedMessage {...messages.required} />
                </StyledWarning>
              )}
              {!hasSeatBasedBillingEnabled && (
                <Box marginTop="20px">
                  <SeatInfo seatType="moderator" />
                </Box>
              )}
            </>
          )}
        </SectionField>

        {!isNilOrError(tenantLocales) && tenantLocales.length > 1 && (
          <SectionField>
            <Label>
              <FormattedMessage {...messages.localeLabel} />
            </Label>

            {tenantLocales.map((currentTenantLocale) => (
              <Radio
                key={currentTenantLocale}
                onChange={handleLocaleOnChange}
                currentValue={selectedLocale}
                value={currentTenantLocale}
                label={appLocalePairs[currentTenantLocale]}
                name="locales"
                id={`locale-${currentTenantLocale}`}
              />
            ))}
          </SectionField>
        )}

        <SectionField>
          <Label>
            <FormattedMessage {...messages.addToGroupLabel} />
          </Label>
          <MultipleSelect
            value={selectedGroups}
            options={groupOptions}
            onChange={handleSelectedGroupsOnChange}
            placeholder={<FormattedMessage {...messages.groupsPlaceholder} />}
          />
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.inviteTextLabel} />
          </Label>
          <QuillEditor
            id="invite-text"
            value={selectedInviteText || ''}
            onChange={handleInviteTextOnChange}
            limitedTextFormatting
            noImages
            noVideos
            withCTAButton
          />
        </SectionField>
      </Box>
    </Collapse>
  );

  return (
    <>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      <form onSubmit={handleSubmitAction} id="e2e-invitations">
        <Section>
          <StyledTabs
            items={invitationTabs}
            selectedValue={selectedView || 'import'}
            onClick={resetWithView}
          />

          {selectedView === 'import' && (
            <>
              <SectionField>
                <StyledSectionTitle>
                  <FormattedMessage {...messages.downloadFillOutTemplate} />
                </StyledSectionTitle>
                <Text fontSize="base">
                  <Box display="flex" justifyContent="space-between">
                    <DownloadButton
                      buttonStyle="secondary"
                      icon="download"
                      onClick={downloadExampleFile}
                    >
                      <FormattedMessage {...messages.downloadTemplate} />
                    </DownloadButton>
                  </Box>
                  <SectionParagraph>
                    <FormattedMessage
                      {...messages.visitSupportPage}
                      values={{
                        supportPageLink: (
                          <a
                            href={formatMessage(messages.invitesSupportPageURL)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FormattedMessage
                              {...messages.supportPageLinkText}
                            />
                          </a>
                        ),
                      }}
                    />
                  </SectionParagraph>
                  <SectionParagraph>
                    <FormattedMessage {...messages.fileRequirements} />
                  </SectionParagraph>
                </Text>

                <StyledSectionTitle>
                  <FormattedMessage {...messages.uploadCompletedFile} />
                </StyledSectionTitle>

                <Box marginBottom="20px" marginTop="15px">
                  <input
                    type="file"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileInputOnChange}
                    ref={fileInputElement}
                  />
                </Box>
                <Error text={filetypeError} />
              </SectionField>

              <StyledSectionTitle>
                <FormattedMessage {...messages.configureInvitations} />
              </StyledSectionTitle>
              {invitationOptions}
            </>
          )}

          {selectedView === 'text' && (
            <>
              <SectionField>
                <Label htmlFor="e2e-emails">
                  <FormattedMessage {...messages.emailListLabel} />
                </Label>
                <TextArea
                  value={selectedEmails || ''}
                  onChange={handleEmailListOnChange}
                  id="e2e-emails"
                />
              </SectionField>

              {invitationOptions}
            </>
          )}

          <SectionField>
            <Box display="flex" alignItems="center" paddingTop="30px">
              <SubmitWrapper
                loading={processing}
                status={getSubmitState(apiErrors, processed)}
                messages={{
                  buttonSave: messages.save,
                  buttonSuccess: messages.saveSuccess,
                  messageError: messages.saveErrorMessage,
                  messageSuccess: messages.saveSuccessMessage,
                }}
              />

              {processing && (
                <Box color={colors.textSecondary} marginLeft="15px">
                  <FormattedMessage {...messages.processing} />
                </Box>
              )}
            </Box>

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
      {hasSeatBasedBillingEnabled && newSeatsResponse && (
        <Suspense fallback={null}>
          <InviteUsersWithSeatsModal
            inviteUsers={() => onSubmit({ save: true })}
            showModal={showModal}
            closeModal={closeModal}
            newSeatsResponse={newSeatsResponse}
          />
        </Suspense>
      )}
    </>
  );
};

const Data = adopt<DataProps>({
  projects: (
    <GetProjects publicationStatuses={['draft', 'published', 'archived']} />
  ),
  locale: <GetLocale />,
  tenantLocales: <GetAppConfigurationLocales />,
  groups: <GetGroups membershipType="manual" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => <Invitations {...inputProps} {...dataProps} />}
  </Data>
);
