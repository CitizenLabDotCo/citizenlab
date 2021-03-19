import React, { useEffect, useState } from 'react';
import ProjectTemplatePreviewAdmin from './ProjectTemplatePreviewAdmin';
import eventEmitter from 'utils/eventEmitter';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { trackPage } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';

interface Props {
  onRender: (hasRendered: boolean) => void;
}

const useCapture = false;

const Component = ({ onRender }: Props) => {
  const locale = useLocale();
  const [selectedProjectTemplateId, setSelectedProjectTemplateId] = useState<
    string | null
  >(null);
  const [url, setUrl] = useState<string | null>(null);
  const [goBackUrl, setGoBackUrl] = useState<string | null>(null);
  const [unlisten, setUnlisten] = useState<Function | null>(null);

  const closeTemplatePreview = () => {
    setSelectedProjectTemplateId(null);
    onRender(false);
  };

  const cleanup = () => {
    if (goBackUrl) {
      window.removeEventListener('popstate', handlePopstateEvent, useCapture);
      window.removeEventListener('keydown', handleKeypress, useCapture);

      if (window.location.href === url) {
        window.history.pushState({ path: goBackUrl }, '', goBackUrl);
      }
    }

    setUrl(null);
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
        if (typeof eventValue === 'string') {
          const selectedProjectTemplateId = eventValue;
          const url = `/admin/projects/templates/${selectedProjectTemplateId}`;

          if (!isNilOrError(locale) && url) {
            setUrl(`${window.location.origin}/${locale}${url}`);
            setGoBackUrl('window.location.href');
            setGoBackUrl(
              `${window.location.origin}/${locale}${
                removeLocale(window.location.pathname).pathname
              }`
            );
            window.history.pushState({ path: url }, '', url);
            window.addEventListener(
              'popstate',
              handlePopstateEvent,
              useCapture
            );
            window.addEventListener('keydown', handleKeypress, useCapture);
            setUnlisten(clHistory.listen(() => closeTemplatePreview()));
            trackPage(url);
          }

          window.scrollTo(0, 0);
          setSelectedProjectTemplateId(selectedProjectTemplateId);
        }

        return () => {
          cleanup();
          subscription.unsubscribe();
        };
      });
  }, [locale]);

  useEffect(() => {
    cleanup();
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

export default Component;
