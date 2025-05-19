import React, { useState } from 'react';

import {
  Box,
  Button,
  colors,
  stylingConsts,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { CLErrors } from 'typings';

import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useCreateOfflineUser from 'api/import_ideas/useCreateOfflineUser';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import usePhase from 'api/phases/usePhase';
import { IUser } from 'api/users/types';
import useUpdateUser from 'api/users/useUpdateUser';
import useUserById from 'api/users/useUserById';

import useInputSchema from 'hooks/useInputSchema';
import useLocalize from 'hooks/useLocalize';

import { getFormValues as getIdeaFormValues } from 'containers/IdeasEditPage/utils';

import { FormValues } from 'components/Form/typings';
import customAjv from 'components/Form/utils/customAjv';
import removeRequiredOtherFields from 'components/Form/utils/removeRequiredOtherFields';

import { FormattedMessage } from 'utils/cl-intl';
import { geocode } from 'utils/locationTools';

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

const IdeaEditor = ({ ideaId, setIdeaId }: Props) => {
  const localize = useLocalize();

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const [userFormStatePerIdea, setUserFormStatePerIdea] = useState<
    Record<string, UserFormData>
  >({});
  const [ideaFormStatePerIdea, setIdeaFormStatePerIdea] = useState<
    Record<string, FormValues>
  >({});
  const [ideaFormApiErrors, setIdeaFormApiErrors] = useState<
    CLErrors | undefined
  >();

  const { schema, uiSchema } = useInputSchema({
    projectId,
    phaseId,
  });
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

  if (!schema || !uiSchema) return null;

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
      idea && schema
      ? getIdeaFormValues(idea, schema)
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

  const schemaToValidate = removeRequiredOtherFields(
    schema,
    ideaFormData || {}
  );
  const ideaFormDataValid = ideaFormData
    ? customAjv.validate(schemaToValidate, ideaFormData)
    : false;

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

    const {
      location_description,
      idea_files_attributes: _idea_files_attributes,
      idea_images_attributes: _idea_images_attributes,
      topic_ids: _topic_ideas,
      cosponsor_ids: _cosponsor_ids,
      author_id: _author_id,
      ...supportedFormData
    } = ideaFormData;

    const location_point_geojson =
      typeof location_description === 'string' &&
      location_description.length > 0
        ? await geocode(location_description)
        : undefined;

    try {
      await updateIdea({
        id: ideaId,
        requestBody: {
          publication_status: 'published',
          ...supportedFormData,
          ...(location_description ? { location_description } : {}),
          ...(location_point_geojson ? { location_point_geojson } : {}),
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
    } catch (e) {
      setIdeaFormApiErrors(e.errors);
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
              schema={schema}
              uiSchema={uiSchema}
              showAllErrors={true}
              apiErrors={ideaFormApiErrors}
              formData={ideaFormData ?? {}}
              ideaMetadata={ideaMetadata}
              setFormData={setIdeaFormData}
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
