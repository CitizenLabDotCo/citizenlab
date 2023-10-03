import React, { useState } from 'react';
import Tippy from '@tippyjs/react';

// routing
import { useParams } from 'react-router-dom';

// api
import useInputSchema from 'hooks/useInputSchema';
import useIdeaById from 'api/ideas/useIdeaById';
import useUserById from 'api/users/useUserById';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import usePhase from 'api/phases/usePhase';
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';
import MetaBox from './MetaBox';
import IdeaForm from './IdeaForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// utils
import { isValidData } from 'components/Form/utils';
import { customAjv } from 'components/Form';
import { getFormValues as getIdeaFormValues } from 'containers/IdeasEditPage/utils';
import { geocode } from 'utils/locationTools';
import { getNextIdeaId, getUserFormValues } from './utils';

// typings
import { FormData } from 'components/Form/typings';
import { CLErrors } from 'typings';
import { UserFormData } from './typings';
import UserForm from './UserForm';

interface Props {
  ideaId: string | null;
  setIdeaId: (ideaId: null | string) => void;
}

const IdeaEditor = ({ ideaId, setIdeaId }: Props) => {
  const localize = useLocalize();

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const [userFormStatePerIdea, setUserFormStatePerIdea] = useState<
    Record<string, UserFormData>
  >({});
  const [ideaFormStatePerIdea, setIdeaFormStatePerIdea] = useState<
    Record<string, FormData>
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
  const { mutateAsync: updateIdea, isLoading: loadingApproveIdea } =
    useUpdateIdea();

  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: idea?.data.relationships.idea_import?.data?.id,
  });

  const selectedPhaseId =
    phaseId ?? idea?.data.relationships.phases.data[0]?.id;
  const { data: phase } = usePhase(selectedPhaseId);

  if (!schema || !uiSchema) return null;

  const userFormData = getUserFormValues(
    ideaId,
    userFormStatePerIdea,
    author,
    ideaMetadata
  );

  const ideaFormData: FormData | null =
    ideaId && ideaFormStatePerIdea[ideaId]
      ? ideaFormStatePerIdea[ideaId]
      : idea && schema
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

  const setIdeaFormData = (ideaFormData: FormData) => {
    if (!ideaId) return;

    setIdeaFormStatePerIdea((ideaFormStatePerIdea) => ({
      ...ideaFormStatePerIdea,
      [ideaId]: ideaFormData,
    }));
  };

  const formDataValid = isValidData(
    schema,
    uiSchema,
    ideaFormData,
    customAjv,
    false
  );

  const onApproveIdea = async () => {
    if (!ideaId || !ideaFormData || !formDataValid || !ideas) return;

    const {
      location_description,
      idea_files_attributes: _idea_files_attributes,
      idea_images_attributes: _idea_images_attributes,
      topic_ids: _topic_ideas,
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
        },
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

  const locale = ideaMetadata?.data.attributes.locale;

  const disabledReason = formDataValid ? null : (
    <FormattedMessage {...messages.formDataNotValid} />
  );

  return (
    <>
      <Box
        px="12px"
        borderBottom={`1px ${colors.grey400} solid`}
        overflowY="scroll"
        w="100%"
        h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - 160px)`}
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
              formData={ideaFormData}
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
          <Tippy
            disabled={!disabledReason}
            interactive={true}
            placement="top"
            content={disabledReason || <></>}
          >
            <div>
              <Button
                icon="check"
                w="100%"
                processing={loadingApproveIdea}
                disabled={!formDataValid}
                onClick={onApproveIdea}
              >
                <FormattedMessage {...messages.approve} />
              </Button>
            </div>
          </Tippy>
        )}
      </Box>
    </>
  );
};

export default IdeaEditor;
