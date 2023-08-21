import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// api
import useUpdateIdea from 'api/ideas/useUpdateIdea';

// routing
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// components
import { Box } from '@citizenlab/cl2-component-library';
import TopBar from './TopBar';
import ImportModal from './ImportModal';
import ReviewSection from './ReviewSection';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// typings
import { FormData } from 'components/Form/typings';

const OfflineInputImporter = () => {
  const [search] = useSearchParams();
  const ideaId = search.get('idea_id');

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const { mutateAsync: updateIdea } = useUpdateIdea();

  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);

  const onSubmit = async () => {
    if (!ideaId || !formData) return;

    await updateIdea({
      id: ideaId,
      requestBody: {
        publication_status: 'published',
        title_multiloc: formData.title_multiloc,
        body_multiloc: formData.body_multiloc,
      },
    });

    removeSearchParams(['idea_id']);
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
            <ReviewSection formData={formData} setFormData={setFormData} />
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
