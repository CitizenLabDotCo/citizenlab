import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// api
import useFeatureFlag from 'hooks/useFeatureFlag';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useInputSchema from 'hooks/useInputSchema';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';

// routing
import { useParams } from 'react-router-dom';

// components
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import TopBar from './TopBar';
import ImportModal from './ImportModal';
import ReviewSection from './ReviewSection';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// utils
import { isValidData } from 'components/Form/utils';
import { customAjv } from 'components/Form';
import { getFormValues } from 'containers/IdeasEditPage/utils';
import { geocode } from 'utils/locationTools';
import { getNextIdeaId } from './utils';

// typings
import { FormData } from 'components/Form/typings';
import { CLErrors } from 'typings';

const OfflineInputImporter = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formStatePerIdea, setFormStatePerIdea] = useState<
    Record<string, FormData>
  >({});

  const { data: idea } = useIdeaById(ideaId ?? undefined, false);
  const { data: ideas, isLoading } = useImportedIdeas({ projectId, phaseId });
  const { mutateAsync: updateIdea, isLoading: loadingApproveIdea } =
    useUpdateIdea();
  const { mutate: deleteIdea } = useDeleteIdea();

  const { schema, uiSchema } = useInputSchema({
    projectId,
    phaseId,
  });

  const formData: FormData =
    ideaId && formStatePerIdea[ideaId]
      ? formStatePerIdea[ideaId]
      : idea && schema
      ? getFormValues(idea, schema)
      : null;

  const setFormData = (formData: FormData) => {
    if (!ideaId) return;

    setFormStatePerIdea((formState) => ({
      ...formState,
      [ideaId]: formData,
    }));
  };

  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);

  if (!schema || !uiSchema || isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
        zIndex="10000"
        position="fixed"
        bgColor={colors.background}
        h="100vh"
      >
        <Spinner />
      </Box>
    );
  }

  const formDataValid = isValidData(
    schema,
    uiSchema,
    formData,
    customAjv,
    false
  );

  const onApproveIdea = async () => {
    if (!ideaId || !formData || !formDataValid || !ideas) return;

    const {
      location_description,
      idea_files_attributes: _idea_files_attributes,
      idea_images_attributes: _idea_images_attributes,
      topic_ids: _topic_ideas,
      ...supportedFormData
    } = formData;

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

      setFormStatePerIdea((formState) => {
        const clone = { ...formState };
        delete clone[ideaId];

        return clone;
      });

      const nextIdeaId = getNextIdeaId(ideaId, ideas);
      setIdeaId(nextIdeaId);
    } catch (e) {
      setApiErrors(e.errors);
    }
  };

  const onDeleteIdea = (idToBeDeleted: string) => {
    deleteIdea(idToBeDeleted, {
      onSuccess: () => {
        if (ideaId === idToBeDeleted) {
          setIdeaId(null);
        }
      },
    });
  };

  const handleSelectIdea = (ideaId: string) => {
    setIdeaId(ideaId);
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        w="100%"
        zIndex="10000"
        position="fixed"
        bgColor={colors.background}
        h="100vh"
      >
        <FocusOn>
          <TopBar onClickPDFImport={openImportModal} />
          <Box
            mt={`${stylingConsts.mobileMenuHeight}px`}
            h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
          >
            <ReviewSection
              ideaId={ideaId}
              apiErrors={apiErrors}
              formData={formData}
              formDataValid={formDataValid}
              loadingApproveIdea={loadingApproveIdea}
              onSelectIdea={handleSelectIdea}
              setFormData={setFormData}
              onApproveIdea={onApproveIdea}
              onDeleteIdea={onDeleteIdea}
            />
          </Box>
        </FocusOn>
      </Box>
      <ImportModal open={importModalOpen} onClose={closeImportModal} />
    </>
  );
};

const OfflineInputImporterWrapper = () => {
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  if (!importPrintedFormsEnabled) return null;

  const modalPortalElement = document.getElementById('modal-portal');
  if (!modalPortalElement) return null;

  return createPortal(<OfflineInputImporter />, modalPortalElement);
};

export default OfflineInputImporterWrapper;
