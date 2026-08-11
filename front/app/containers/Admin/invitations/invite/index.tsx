import React, {
  useState,
  useRef,
  useEffect,
  lazy,
  Suspense,
  ChangeEvent,
  useCallback,
} from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { isString, isEmpty } from 'lodash-es';
import { useForm, FieldPath, FieldPathValue } from 'react-hook-form';
import styled from 'styled-components';
import { SupportedLocale, IOption } from 'typings';

import { INewBulkInvite } from 'api/invites/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { Section, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import HelmetIntl from 'components/HelmetIntl';
import Error from 'components/UI/Error';
// A creation that times out and one that errors say the same thing, so they
// share a string.
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

// Re-exported: the tests import them from here.
export { COUNT_TIMEOUT_MS, CREATE_TIMEOUT_MS } from './useInviteSubmission';

interface InviteFormValues {
  emails: string | null;
  fileBase64: string | null;
  adminRights: boolean;
  moderatorRights: boolean;
  locale: SupportedLocale | null;
  projects: IOption[] | null;
  groups: IOption[] | null;
  inviteText: string | null;
}

const emptyForm: InviteFormValues = {
  emails: null,
  fileBase64: null,
  adminRights: false,
  moderatorRights: false,
  locale: null,
  projects: null,
  groups: null,
  inviteText: null,
};

const Invitations = () => {
  const { formatMessage } = useIntl();
  const tenantLocales = useAppConfigurationLocales();

  const { watch, setValue, reset } = useForm<InviteFormValues>({
    defaultValues: emptyForm,
  });
  const values = watch();

  // About the page rather than the invitation, so not part of the form.
  const [selectedView, setSelectedView] = useState<TInviteTabName>('template');
  const [invitationOptionsOpened, setInvitationOptionsOpened] =
    useState<boolean>(false);
  const [filetypeError, setFiletypeError] = useState<JSX.Element | null>(null);

  // A file input's value cannot be set from React, so clearing it needs the
  // DOM node.
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const clearFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Clear what the form was holding once the invites exist.
  const handleCreated = useCallback(() => {
    setValue('fileBase64', null);
    setValue('emails', null);
    clearFileInput();
  }, [setValue, clearFileInput]);

  const {
    submission,
    isWaitingOnJob,
    submit,
    confirmSeats,
    cancel,
    dismissResult,
  } = useInviteSubmission({ onCreated: handleCreated });

  // Editing the form dismisses whatever the last submission reported.
  const updateField = <K extends FieldPath<InviteFormValues>>(
    field: K,
    value: FieldPathValue<InviteFormValues, K>
  ) => {
    dismissResult();
    setValue(field, value);
  };

  const getRoles = () => {
    const roles: INewBulkInvite['roles'] = [];

    if (values.adminRights) {
      roles.push({ type: 'admin' });
    }

    if (values.moderatorRights && values.projects && values.projects.length) {
      values.projects.forEach((project) => {
        roles.push({ type: 'project_moderator', project_id: project.value });
      });
    }

    return roles;
  };

  // The payload for whichever tab is active, or null when there is nothing
  // to send.
  const buildInviteOptions = (): InviteOptions | null => {
    const bulkInvite: INewBulkInvite = {
      locale: values.locale,
      roles: getRoles(),
      group_ids: values.groups?.length
        ? values.groups.map((group) => group.value)
        : null,
      invite_text: values.inviteText,
    };

    if (selectedView === 'template') {
      return isString(values.fileBase64)
        ? { ...bulkInvite, xlsx: values.fileBase64 }
        : null;
    }

    return isString(values.emails)
      ? {
          ...bulkInvite,
          emails: values.emails.split(',').map((item) => item.trim()),
        }
      : null;
  };

  useEffect(() => {
    if (tenantLocales && !values.locale) {
      setValue('locale', tenantLocales[0]);
    }
  }, [tenantLocales, values.locale, setValue]);

  const handleEmailListOnChange = (emails: string) =>
    updateField('emails', emails);

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
      clearFileInput();
    }

    updateField(
      'fileBase64',
      selectedFile ? await getBase64FromFile(selectedFile) : null
    );
    setFiletypeError(filetypeError);
  };

  const handleAdminRightsOnToggle = () =>
    updateField('adminRights', !values.adminRights);

  const handleModeratorRightsOnToggle = () =>
    updateField('moderatorRights', !values.moderatorRights);

  const handleLocaleOnChange = (locale: SupportedLocale) =>
    updateField('locale', locale);

  const handleSelectedProjectsOnChange = (projects: IOption[]) =>
    updateField('projects', projects.length > 0 ? projects : null);

  const handleSelectedGroupsOnChange = (groups: IOption[]) =>
    updateField('groups', groups.length > 0 ? groups : null);

  const handleInviteTextOnChange = (inviteText: string) =>
    updateField('inviteText', inviteText);

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

  const resetWithView = (view: TInviteTabName) => {
    setSelectedView(view);
    reset({ ...emptyForm, locale: tenantLocales ? tenantLocales[0] : null });
    clearFileInput();
    setInvitationOptionsOpened(false);
    setFiletypeError(null);
    dismissResult();
  };

  const validateInvitation = () => {
    const isValidEmails = isString(values.emails) && !isEmpty(values.emails);
    const hasValidRights = values.moderatorRights
      ? !isEmpty(values.projects)
      : true;
    const isValidInvitationTemplate =
      isString(values.fileBase64) && !isEmpty(values.fileBase64);
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

  // The count rolls its work back, so "nothing was sent" is only safe there.
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
              fileInputRef={fileInputRef}
            />
          )}

          {selectedView === 'manual' && (
            <ManualTab
              selectedEmails={values.emails}
              handleEmailListOnChange={handleEmailListOnChange}
            />
          )}

          <Suspense fallback={null}>
            <InvitationOptions
              invitationOptionsOpened={invitationOptionsOpened}
              onToggleOptions={toggleOptions}
              selectedView={selectedView}
              inviteesWillHaveAdminRights={values.adminRights}
              inviteesWillHaveModeratorRights={values.moderatorRights}
              handleAdminRightsOnToggle={handleAdminRightsOnToggle}
              handleModeratorRightsOnToggle={handleModeratorRightsOnToggle}
              onLocaleOnChange={handleLocaleOnChange}
              selectedLocale={values.locale}
              handleSelectedProjectsOnChange={handleSelectedProjectsOnChange}
              handleSelectedGroupsOnChange={handleSelectedGroupsOnChange}
              handleInviteTextOnChange={handleInviteTextOnChange}
              selectedProjects={values.projects}
              selectedGroups={values.groups}
              selectedInviteText={values.inviteText}
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
