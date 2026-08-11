// change to reset CI trigger after force push

import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  ChangeEvent,
  useCallback,
} from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { isString, isEmpty } from 'lodash-es';
import styled from 'styled-components';
import { SupportedLocale, IOption } from 'typings';

import { INewBulkInvite } from 'api/invites/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { Section, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import HelmetIntl from 'components/HelmetIntl';
import Error from 'components/UI/Error';
// A creation that times out and one that errors say the same thing to the admin,
// so they share a string instead of keeping two identical ones.
import errorMessages from 'components/UI/Error/messages';
import Tabs from 'components/UI/Tabs';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getBase64FromFile } from 'utils/fileUtils';

import messages from '../messages';

import ManualTab from './ManualTab';
import TemplateTab from './TemplateTab';
import useInviteSubmission, {
  InviteOptions,
  seatsModalContent,
} from './useInviteSubmission';

const InviteUsersWithSeatsModal = lazy(
  () => import('components/admin/SeatBasedBilling/InviteUsersWithSeatsModal')
);
const InvitationOptions = lazy(() => import('./InvitationOptions'));

const StyledTabs = styled(Tabs)`
  margin-bottom: 35px;
`;

export type TInviteTabName = 'template' | 'manual';

// The budgets live with the machine that applies them; re-exported because the
// tests reach for them here.
export { COUNT_TIMEOUT_MS, CREATE_TIMEOUT_MS } from './useInviteSubmission';

const Invitations = () => {
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();
  const [selectedEmails, setSelectedEmails] = useState<string | null>(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(
    null
  );
  const [inviteesWillHaveAdminRights, setInviteesWillHaveAdminRights] =
    useState<boolean>(false);
  const [inviteesWillHaveModeratorRights, setInviteesWillHaveModeratorRights] =
    useState<boolean>(false);
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    null
  );
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
  const [filetypeError, setFiletypeError] = useState<JSX.Element | null>(null);

  // The invites exist; clear what the form was holding to create them.
  const handleCreated = useCallback(() => {
    setSelectedFileBase64(null);
    setSelectedEmails(null);
  }, []);

  const {
    submission,
    isWaitingOnJob,
    submit,
    confirmSeats,
    cancel,
    dismissResult,
  } = useInviteSubmission({ onCreated: handleCreated });

  const getRoles = useCallback(() => {
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
  }, [
    inviteesWillHaveAdminRights,
    inviteesWillHaveModeratorRights,
    selectedProjects,
  ]);

  // The form's payload for whichever tab is active. Null when the tab has
  // nothing to send, which is what the submit button's disabled state reflects.
  const buildInviteOptions = (): InviteOptions | null => {
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
      return isString(selectedFileBase64)
        ? { ...bulkInvite, xlsx: selectedFileBase64 }
        : null;
    }

    return isString(selectedEmails)
      ? {
          ...bulkInvite,
          emails: selectedEmails.split(',').map((item) => item.trim()),
        }
      : null;
  };

  useEffect(() => {
    if (tenantLocales && !selectedLocale) {
      setSelectedLocale(tenantLocales[0]);
    }
  }, [tenantLocales, selectedLocale]);

  const handleEmailListOnChange = (selectedEmails: string) => {
    dismissResult();
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
    }

    const selectedFileBase64 = selectedFile
      ? await getBase64FromFile(selectedFile)
      : null;
    dismissResult();
    setSelectedFileBase64(selectedFileBase64);
    setFiletypeError(filetypeError);
  };

  const handleAdminRightsOnToggle = () => {
    dismissResult();
    setInviteesWillHaveAdminRights(!inviteesWillHaveAdminRights);
  };

  const handleModeratorRightsOnToggle = () => {
    dismissResult();
    setInviteesWillHaveModeratorRights(!inviteesWillHaveModeratorRights);
  };

  const handleLocaleOnChange = (selectedLocale: SupportedLocale) => {
    dismissResult();
    setSelectedLocale(selectedLocale);
  };

  const handleSelectedProjectsOnChange = (selectedProjects: IOption[]) => {
    dismissResult();
    setSelectedProjects(selectedProjects.length > 0 ? selectedProjects : null);
  };

  const handleSelectedGroupsOnChange = (selectedGroups: IOption[]) => {
    dismissResult();
    setSelectedGroups(selectedGroups.length > 0 ? selectedGroups : null);
  };

  const handleInviteTextOnChange = (selectedInviteText: string) => {
    dismissResult();
    setSelectedInviteText(selectedInviteText);
  };

  const getSubmitState = () => {
    const isInvitationValid = validateInvitation();

    if (apiErrors && apiErrors.length > 0) {
      return 'error';
    } else if (submission.status === 'created' && !isInvitationValid) {
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
    setFiletypeError(null);
    dismissResult();
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

  const handleSubmitAction = async (event: React.FormEvent) => {
    event.preventDefault();

    const options = buildInviteOptions();
    if (options) {
      await submit(options);
    }
  };

  const apiErrors =
    submission.status === 'failed' && submission.failure.reason === 'apiErrors'
      ? submission.failure.errors
      : null;

  // The count rolls its work back, so "nothing was sent" is safe there. A
  // creation that times out and one that errors say the same thing, and share
  // a string rather than keeping two identical ones.
  const failureMessages = {
    countTimedOut: messages.processingNotStartedError,
    createTimedOut: errorMessages.unexpected_invite_error,
    rejected: messages.unknownError,
    apiErrors: null,
  } as const;

  const failureMessage =
    submission.status === 'failed'
      ? failureMessages[submission.failure.reason]
      : null;

  const seatsModal = seatsModalContent(submission);

  const invitationTabs: {
    name: TInviteTabName;
    label: string;
    className: string;
  }[] = [
    {
      name: 'template',
      label: formatMessage(messages.importTab),
      className: 'intercom-users-invite-users-tab-import',
    },
    {
      name: 'manual',
      label: formatMessage(messages.textTab),
      className: 'intercom-users-invite-users-tab-manual',
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
            selectedValue={selectedView}
            onClick={resetWithView}
          />
          <Box mb={selectedView === 'template' ? '16px' : '36px'}>
            <Warning>
              <Text color="primary" m="0px">
                {formatMessage(messages.invitationExpirationWarning)}
              </Text>
            </Warning>
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
                loading={isWaitingOnJob}
                status={getSubmitState()}
                messages={{
                  buttonSave: messages.save,
                  buttonSuccess: messages.saveSuccess,
                  messageError: messages.saveErrorMessage,
                  messageSuccess: messages.saveSuccessMessage,
                }}
              />

              {isWaitingOnJob && (
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

            <Error
              text={
                failureMessage ? <FormattedMessage {...failureMessage} /> : null
              }
            />
          </SectionField>
        </Section>
      </form>
      {seatsModal && (
        <Suspense fallback={null}>
          <InviteUsersWithSeatsModal
            inviteUsers={confirmSeats}
            showModal
            closeModal={cancel}
            newSeatsResponse={seatsModal}
          />
        </Suspense>
      )}
    </>
  );
};

export default Invitations;
