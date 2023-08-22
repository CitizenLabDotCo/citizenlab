import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useInputSchema from 'hooks/useInputSchema';

// routing
import { useParams, useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

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

// typings
import { FormData } from 'components/Form/typings';
import { IIdea } from 'api/ideas/types';

const getFormData = (idea: IIdea) => {
  const { title_multiloc, body_multiloc } = idea.data.attributes;

  return {
    title_multiloc,
    body_multiloc,
  };
};

const OfflineInputImporter = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const [search] = useSearchParams();
  const ideaId = search.get('idea_id');

  const [showAllErrors, setShowAllErrors] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formStatePerIdea, setFormStatePerIdea] = useState<
    Record<string, FormData>
  >({});

  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { schema, uiSchema } = useInputSchema({
    projectId,
    // phaseId, // TODO
  });

  const formData =
    ideaId && formStatePerIdea[ideaId]
      ? formStatePerIdea[ideaId]
      : idea
      ? getFormData(idea)
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

  const onSubmit = async () => {
    if (!ideaId || !formData || !schema || !uiSchema) return;
    setShowAllErrors(true);

    if (isValidData(schema, uiSchema, formData, customAjv, false)) {
      await updateIdea({
        id: ideaId,
        requestBody: {
          publication_status: 'published',
          title_multiloc: formData.title_multiloc,
          body_multiloc: formData.body_multiloc,
        },
      });

      removeSearchParams(['idea_id']);
    }
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
            onApproveIdea={ideaId ? onSubmit : undefined}
            onClickPDFImport={openImportModal}
          />
          <Box
            mt={`${stylingConsts.mobileMenuHeight}px`}
            h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
          >
            <ReviewSection
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
