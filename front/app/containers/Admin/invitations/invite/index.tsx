import React, {
  useState,
  useRef,
  useEffect,
  lazy,
  Suspense,
  ChangeEvent,
} from 'react';
import { isString, isEmpty } from 'lodash-es';
import { getBase64FromFile } from 'utils/fileUtils';

// components
import Error from 'components/UI/Error';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Tabs from 'components/UI/Tabs';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';

const InviteUsersWithSeatsModal = lazy(
  () => import('components/admin/SeatBasedBilling/InviteUsersWithSeatsModal')
);
import TemplateTab from './TemplateTab';
import ManualTab from './ManualTab';
const InvitationOptions = lazy(() => import('./InvitationOptions'));

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useExceedsSeats from 'hooks/useExceedsSeats';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// services
import {
  IInviteError,
  INewBulkInvite,
  IInvitesNewSeats,
} from 'api/invites/types';

import useBulkInviteEmails from 'api/invites/useBulkInviteEmails';
import useBulkInviteCountNewSeatsEmails from 'api/invites/useBulkInviteCountNewSeatsEmails';
import useBulkInviteXLSX from 'api/invites/useBulkInviteXLSX';
import useBulkInviteCountNewSeatsXLSX from 'api/invites/useBulkInviteCountNewSeatsXLSX';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { Locale, IOption } from 'typings';
import Warning from 'components/UI/Warning';

const StyledTabs = styled(Tabs)`
  margin-bottom: 35px;
`;

export type TInviteTabName = 'template' | 'manual';

const Invitations = () => {
  const { formatMessage } = useIntl();
  const { mutateAsync: bulkInviteEmails } = useBulkInviteEmails();
  const { mutateAsync: bulkInviteCountNewSeatsEmails } =
    useBulkInviteCountNewSeatsEmails();
  const { mutateAsync: bulkInviteXLSX } = useBulkInviteXLSX();
  const { mutateAsync: bulkInviteCountNewSeatsXLSX } =
    useBulkInviteCountNewSeatsXLSX();

  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const tenantLocales = useAppConfigurationLocales();

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
  const [selectedView, setSelectedView] = useState<TInviteTabName>('template');
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

  const resetErrorAndSuccessState = () => {
    setProcessed(false);
    setApiErrors(null);
    setUnknownError(null);
  };

  const handleEmailListOnChange = (selectedEmails: string) => {
    resetErrorAndSuccessState();
    setSelectedEmails(selectedEmails);
  };

  const handleFileInputOnChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
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

  const resetWithView = (selectedView: TInviteTabName) => {
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
  const onSubmit = ({ save }: { save: boolean }) => {
    const bulkInvite: INewBulkInvite = {
      locale: selectedLocale,
      roles: getRoles(),
      group_ids:
        selectedGroups && selectedGroups.length > 0
          ? selectedGroups.map((group) => group.value)
          : null,
      invite_text: selectedInviteText,
    };

    if (selectedView === 'template') {
      onSubmitTemplateTab(bulkInvite, save);
    }

    if (selectedView === 'manual') {
      onSubmitManualTab(bulkInvite, save);
    }
  };

  const onSubmitTemplateTab = async (
    bulkInvite: INewBulkInvite,
    save: boolean
  ) => {
    const hasCorrectSelection = isString(selectedFileBase64);

    if (hasCorrectSelection) {
      try {
        setProcessing(true);
        setProcessed(false);
        setApiErrors(null);
        setFiletypeError(null);
        setUnknownError(null);

        if (isString(selectedFileBase64)) {
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

        if (save) {
          // reset file input
          if (fileInputElement.current) {
            fileInputElement.current.value = '';
          }

          // reset state
          setProcessing(false);
          setProcessed(true);
          setSelectedFileBase64(null);
        }
      } catch (errors) {
        const apiErrors = errors.errors;

        setApiErrors(apiErrors);
        setUnknownError(
          !apiErrors ? <FormattedMessage {...messages.unknownError} /> : null
        );
        setProcessing(false);
      }
    }
  };

  const onSubmitManualTab = async (
    bulkInvite: INewBulkInvite,
    save: boolean
  ) => {
    const hasCorrectSelection = isString(selectedEmails);

    if (hasCorrectSelection) {
      try {
        setProcessing(true);
        setProcessed(false);
        setApiErrors(null);
        setFiletypeError(null);
        setUnknownError(null);

        if (selectedView === 'manual' && isString(selectedEmails)) {
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
        }
      } catch (errors) {
        const apiErrors = errors.errors;
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

  const invitationTabs: { name: TInviteTabName; label: string }[] = [
    {
      name: 'template',
      label: formatMessage(messages.importTab),
    },
    {
      name: 'manual',
      label: formatMessage(messages.textTab),
    },
  ];

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
          <Box mb={selectedView === 'template' ? '16px' : '36px'}>
            <Warning
              text={
                <Text color="primary" m="0px">
                  {formatMessage(messages.invitationExpirationWarning)}
                </Text>
              }
            />
          </Box>
          {selectedView === 'template' && (
            <TemplateTab
              filetypeError={filetypeError}
              handleFileInputOnChange={handleFileInputOnChange}
            />
          )}

          {selectedView === 'manual' && (
            <ManualTab
              selectedEmails={selectedEmails}
              handleEmailListOnChange={handleEmailListOnChange}
            />
          )}

          <Suspense fallback={null}>
            <InvitationOptions
              invitationOptionsOpened={invitationOptionsOpened}
              onToggleOptions={toggleOptions}
              selectedView={selectedView}
              inviteesWillHaveAdminRights={inviteesWillHaveAdminRights}
              inviteesWillHaveModeratorRights={inviteesWillHaveModeratorRights}
              handleAdminRightsOnToggle={handleAdminRightsOnToggle}
              handleModeratorRightsOnToggle={handleModeratorRightsOnToggle}
              onLocaleOnChange={handleLocaleOnChange}
              selectedLocale={selectedLocale}
              handleSelectedProjectsOnChange={handleSelectedProjectsOnChange}
              handleSelectedGroupsOnChange={handleSelectedGroupsOnChange}
              handleInviteTextOnChange={handleInviteTextOnChange}
              selectedProjects={selectedProjects}
              selectedGroups={selectedGroups}
              selectedInviteText={selectedInviteText}
            />
          </Suspense>
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

export default Invitations;
