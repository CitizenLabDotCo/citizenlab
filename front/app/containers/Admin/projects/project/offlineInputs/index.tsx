import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// api
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
  const { projectId } = useParams() as {
    projectId: string;
  };

  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formStatePerIdea, setFormStatePerIdea] = useState<
    Record<string, FormData>
  >({});

  const { data: idea } = useIdeaById(ideaId ?? undefined, false);
  const { mutateAsync: updateIdea, isLoading: loadingApproveIdea } =
    useUpdateIdea();
  const { mutate: deleteIdea, isLoading: loadingDeleteIdea } = useDeleteIdea();
  const { data: phases } = usePhases(projectId);
  const currentPhase = getCurrentPhase(phases?.data);

  const { schema, uiSchema } = useInputSchema({
    projectId,
  });

  const formData =
    ideaId && formStatePerIdea[ideaId]
      ? formStatePerIdea[ideaId]
      : idea && schema
      ? getFormValues(idea, schema)
      : null;

  const phaseId =
    selectedPhaseId ?? (currentPhase ? currentPhase.id : undefined);

  const setFormData = (formData: FormData) => {
    if (!ideaId) return;

    setFormStatePerIdea((formState) => ({
      ...formState,
      [ideaId]: formData,
    }));
  };

  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);

  const onSubmit = async () => {
    if (!ideaId || !formData || !schema || !uiSchema) return;
    setShowAllErrors(true);

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

  const onDelete = () => {
    if (!ideaId) return;
    deleteIdea(ideaId);
    setIdeaId(null);
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
            loadingApproveIdea={loadingApproveIdea}
            loadingDeleteIdea={loadingDeleteIdea}
            onChangePhase={setSelectedPhaseId}
            onApproveIdea={ideaId ? onSubmit : undefined}
            onDeleteIdea={ideaId ? onDelete : undefined}
            onClickPDFImport={openImportModal}
          />
          <Box
            mt={`${stylingConsts.mobileMenuHeight}px`}
            h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
          >
            <ReviewSection
              ideaId={ideaId}
              setIdeaId={setIdeaId}
              apiErrors={apiErrors}
              showAllErrors={showAllErrors}
              formData={formData}
              setFormData={setFormData}
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
