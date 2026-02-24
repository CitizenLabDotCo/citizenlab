import React, { useRef, useState } from 'react';

import {
  Box,
  Button,
  colors,
  stylingConsts,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { UseFormSetError } from 'react-hook-form';

import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useCreateOfflineUser from 'api/import_ideas/useCreateOfflineUser';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import usePhase from 'api/phases/usePhase';
import { IUser } from 'api/users/types';
import useUpdateUser from 'api/users/useUpdateUser';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

import IdeaForm from './IdeaForm';
import MetaBox from './MetaBox';
import { UserFormData } from './typings';
import UserForm from './UserForm';
import {
  getNextIdeaId,
  getUserFormValues,
  isUserFormDataValid,
  getUserFormDataAction,
  getUserChanges,
} from './utils';

interface Props {
  ideaId: string | null;
  setIdeaId: (ideaId: null | string) => void;
}

type FormValues = Record<string, any>;

const IdeaEditor = ({ ideaId, setIdeaId }: Props) => {
  const localize = useLocalize();
  const [ideaFormDataValid, setIdeaFormDataValid] = useState(false);
  const setError = useRef<UseFormSetError<FormValues>>();

  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/input-importer',
  });

  const [userFormStatePerIdea, setUserFormStatePerIdea] = useState<
    Record<string, UserFormData>
  >({});
  const [ideaFormStatePerIdea, setIdeaFormStatePerIdea] = useState<
    Record<string, FormValues>
  >({});

  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const { data: author } = useUserById(
    idea?.data.relationships.author?.data?.id,
    false
  );
  const { data: ideas } = useImportedIdeas({ projectId, phaseId });
  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: idea?.data.relationships.idea_import?.data?.id,
  });

  const locale = ideaMetadata?.data.attributes.locale;

  const { data: phase } = usePhase(phaseId);

  const { mutateAsync: updateIdea, isLoading: loadingApproveIdea } =
    useUpdateIdea();
  const { mutate: updateUser } = useUpdateUser();
  const { mutateAsync: createOfflineUser } = useCreateOfflineUser();

  const userFormData = getUserFormValues(
    ideaId,
    userFormStatePerIdea,
    author,
    ideaMetadata
  );

  const ideaFormData: FormValues | null =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    ideaId && ideaFormStatePerIdea[ideaId]
      ? ideaFormStatePerIdea[ideaId]
      : // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      idea
      ? idea.data.attributes
      : null;

  const setUserFormData = (
    getUserFormData: (oldData: UserFormData) => UserFormData
  ) => {
    if (!ideaId) return;

    setUserFormStatePerIdea((userFormDataPerIdea) => ({
      ...userFormDataPerIdea,
      [ideaId]: getUserFormData(userFormDataPerIdea[ideaId]),
    }));
  };

  const setIdeaFormData = (ideaFormData: FormValues) => {
    if (!ideaId) return;

    setIdeaFormStatePerIdea((ideaFormStatePerIdea) => ({
      ...ideaFormStatePerIdea,
      [ideaId]: ideaFormData,
    }));
  };

  const userFormDataValid = isUserFormDataValid(userFormData);

  const onApproveIdea = async () => {
    if (
      !ideaId ||
      !ideaFormData ||
      !ideaFormDataValid ||
      !ideas ||
      !userFormData ||
      !ideaMetadata
    ) {
      return;
    }

    const userFormDataAction = getUserFormDataAction(
      userFormData,
      author,
      ideaMetadata
    );

    if (userFormDataAction === 'update-created-user' && author) {
      updateUser({
        userId: author.data.id,
        ...getUserChanges(userFormData, author, ideaMetadata),
      });
    }

    let newUser: IUser | undefined;

    if (userFormDataAction === 'create-new-user-and-assign-to-idea' && locale) {
      newUser = await createOfflineUser({
        phaseId,
        email: userFormData.email,
        locale,
        first_name: userFormData.first_name,
        last_name: userFormData.last_name,
      });
    }

    try {
      await updateIdea({
        id: ideaId,
        requestBody: {
          ...ideaFormData,
          publication_status: 'published',
          ...(userFormDataAction === 'remove-assigned-user'
            ? { author_id: null }
            : {}),
          ...(userFormDataAction === 'assign-existing-user-to-idea' &&
          userFormData.user_id
            ? { author_id: userFormData.user_id }
            : {}),
          ...(userFormDataAction === 'create-new-user-and-assign-to-idea' &&
          newUser
            ? { author_id: newUser.data.id }
            : {}),
        },
      });

      setUserFormStatePerIdea((userFormState) => {
        const clone = { ...userFormState };
        delete clone[ideaId];
        return clone;
      });

      setIdeaFormStatePerIdea((ideaFormState) => {
        const clone = { ...ideaFormState };
        delete clone[ideaId];
        return clone;
      });

      const nextIdeaId = getNextIdeaId(ideaId, ideas);
      setIdeaId(nextIdeaId);
    } catch (error) {
      setError.current &&
        handleHookFormSubmissionError(error, setError.current);
    }
  };

  const phaseName = phase
    ? localize(phase.data.attributes.title_multiloc)
    : undefined;

  const disabledReason = ideaFormDataValid ? null : (
    <FormattedMessage {...messages.formDataNotValid} />
  );

  return (
    <>
      <Box
        px="12px"
        borderBottom={`1px ${colors.grey400} solid`}
        overflowY="scroll"
        w="100%"
        h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - 215px)`}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {ideaMetadata && (
          <>
            <MetaBox phaseName={phaseName} locale={locale} />
            {userFormData && (
              <UserForm
                userFormData={userFormData}
                setUserFormData={setUserFormData}
              />
            )}
            <IdeaForm
              formData={ideaFormData ?? {}}
              setIdeaFormDataValid={setIdeaFormDataValid}
              setFormData={setIdeaFormData}
              setError={setError}
              key={ideaId}
            />
          </>
        )}
      </Box>
      <Box
        h="60px"
        px="24px"
        pb="4px"
        w="100%"
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
      >
        {ideaId && (
          <Tooltip
            disabled={!disabledReason}
            placement="top"
            content={disabledReason || <></>}
          >
            <div>
              <Button
                bgColor={colors.primary}
                icon="check"
                w="100%"
                processing={loadingApproveIdea}
                disabled={!userFormDataValid || !ideaFormDataValid}
                onClick={onApproveIdea}
              >
                <FormattedMessage {...messages.approve} />
              </Button>
            </div>
          </Tooltip>
        )}
      </Box>
    </>
  );
};

export default IdeaEditor;
