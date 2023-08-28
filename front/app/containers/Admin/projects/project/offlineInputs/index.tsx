import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// api
import useFeatureFlag from 'hooks/useFeatureFlag';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useInputSchema from 'hooks/useInputSchema';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import usePhases from 'api/phases/usePhases';

// routing
import { useParams } from 'react-router-dom';

// components
import { Box } from '@citizenlab/cl2-component-library';
import TopBar from './TopBar';
import ImportModal from './ImportModal';
import ReviewSection from './ReviewSection';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// utils
import { isValidData } from 'components/Form/utils';
import { customAjv } from 'components/Form';
import { getFormValues } from 'containers/IdeasEditPage/utils';
import { getCurrentPhase } from 'api/phases/utils';

// typings
import { FormData } from 'components/Form/typings';
import { CLErrors } from 'typings';

const OfflineInputImporter = () => {
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  const { projectId } = useParams() as {
    projectId: string;
  };

  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formStatePerIdea, setFormStatePerIdea] = useState<
    Record<string, FormData>
  >({});

  const { data: idea } = useIdeaById(ideaId ?? undefined, false);
  const { mutateAsync: updateIdea, isLoading: loadingApproveIdea } =
    useUpdateIdea();
  const { mutate: deleteIdea } = useDeleteIdea();
  const { data: phases } = usePhases(projectId);
  const currentPhase = getCurrentPhase(phases?.data);

  const { schema, uiSchema } = useInputSchema({
    projectId,
  });

  if (!importPrintedFormsEnabled) return null;

  const formData =
    ideaId && formStatePerIdea[ideaId]
      ? formStatePerIdea[ideaId]
      : idea && schema
      ? getFormValues(idea, schema)
      : null;

  const phaseId = selectedPhaseId ?? currentPhase?.id;

  const setFormData = (formData: FormData) => {
    if (!ideaId) return;

    setFormStatePerIdea((formState) => ({
      ...formState,
      [ideaId]: formData,
    }));
  };

  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);

  const onApproveIdea = async () => {
    if (!ideaId || !formData || !schema || !uiSchema) return;

    if (isValidData(schema, uiSchema, formData, customAjv, false)) {
      try {
        await updateIdea({
          id: ideaId,
          requestBody: {
            publication_status: 'published',
            title_multiloc: formData.title_multiloc,
            body_multiloc: formData.body_multiloc,
            ...(phaseId ? { phase_ids: [phaseId] } : {}),
          },
        });

        setIdeaId(null);
      } catch (e) {
        setApiErrors(e.errors);
      }
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
          <TopBar
            phaseId={phaseId}
            onChangePhase={setSelectedPhaseId}
            onClickPDFImport={openImportModal}
          />
          <Box
            mt={`${stylingConsts.mobileMenuHeight}px`}
            h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
          >
            <ReviewSection
              phaseId={phaseId}
              ideaId={ideaId}
              apiErrors={apiErrors}
              formData={formData}
              loadingApproveIdea={loadingApproveIdea}
              onSelectIdea={handleSelectIdea}
              setFormData={setFormData}
              onApproveIdea={ideaId ? onApproveIdea : undefined}
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
  const modalPortalElement = document.getElementById('modal-portal');
  if (!modalPortalElement) return null;

  return createPortal(<OfflineInputImporter />, modalPortalElement);
};

export default OfflineInputImporterWrapper;
