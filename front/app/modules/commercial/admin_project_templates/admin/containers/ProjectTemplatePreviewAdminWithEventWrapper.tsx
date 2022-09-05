import React, { useEffect, useState } from 'react';
import ProjectTemplatePreviewAdmin from './ProjectTemplatePreviewAdmin';
import eventEmitter from 'utils/eventEmitter';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { trackPage } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';

interface Props {
  onRender: (hasRendered: boolean) => void;
}

const useCapture = false;

const ProjectTemplatePreviewAdminWithEventWrapper = ({ onRender }: Props) => {
  const locale = useLocale();
  const [selectedProjectTemplateId, setSelectedProjectTemplateId] = useState<
    string | null
  >(null);
  const [goBackUrl, setGoBackUrl] = useState<string | null>(null);
  const [unlisten, setUnlisten] = useState<{ (): void } | null>(null);

  const closeTemplatePreview = () => {
    setSelectedProjectTemplateId(null);
    onRender(false);
    window.history.pushState({ path: goBackUrl }, '', goBackUrl);
  };

  const cleanup = () => {
    if (goBackUrl) {
      window.removeEventListener('popstate', handlePopstateEvent, useCapture);
      window.removeEventListener('keydown', handleKeypress, useCapture);
    }

    setGoBackUrl(null);

    if (typeof unlisten === 'function') {
      unlisten();
      setUnlisten(null);
    }
  };

  const handlePopstateEvent = () => {
    closeTemplatePreview();
  };

  const handleKeypress = (event: KeyboardEvent) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      closeTemplatePreview();
    }
  };

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent<string>('ProjectTemplateCardClicked')
      .subscribe(({ eventValue }) => {
        if (typeof eventValue === 'string' && !isNilOrError(locale)) {
          const selectedProjectTemplateId = eventValue;
          const currentUrl = window.location.href;
          const newPath = `/${locale}/admin/projects/templates/${selectedProjectTemplateId}`;
          const newUrl = `${window.location.origin}${newPath}`;

          setSelectedProjectTemplateId(selectedProjectTemplateId);
          setGoBackUrl(currentUrl);

          window.history.pushState({ path: newUrl }, '', newUrl);
          window.addEventListener('popstate', handlePopstateEvent, useCapture);
          window.addEventListener('keydown', handleKeypress, useCapture);
          setUnlisten(clHistory.listen(() => closeTemplatePreview()));
          trackPage(newUrl);

          window.scrollTo(0, 0);
        }

        return () => {
          cleanup();
          subscription.unsubscribe();
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectTemplateId]);

  if (selectedProjectTemplateId) {
    return (
      <ProjectTemplatePreviewAdmin
        projectTemplateId={selectedProjectTemplateId}
        goBack={closeTemplatePreview}
        onRender={onRender}
      />
    );
  }

  return null;
};

export default ProjectTemplatePreviewAdminWithEventWrapper;
