import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import Footer from 'components/PostShowComponents/Footer';

import { trackEventByName } from 'utils/analytics';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

const Modals = lazy(() => import('./modals'));
import LargerThanPhone from './LargerThanPhone';
import Phone from './Phone';
import tracks from './tracks';

interface Props {
  initiativeId: string;
  className?: string;
}

const InitiativesShow = ({ initiativeId, className }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const [searchParams] = useSearchParams();
  const newInitiativeId = searchParams.get('new_initiative_id');

  const [initiativeIdForSocialSharing, setInitiativeIdForSocialSharing] =
    useState<string | null>(null);
  const [translateButtonClicked, setTranslateButtonClicked] = useState(false);
  const [
    a11y_pronounceLatestOfficialFeedbackPost,
    setA11y_pronounceLatestOfficialFeedbackPost,
  ] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (typeof newInitiativeId === 'string') {
      setTimeout(() => {
        setInitiativeIdForSocialSharing(newInitiativeId);
      }, 1500);

      removeSearchParams(['new_initiative_id']);
    }
  }, [newInitiativeId]);

  useEffect(() => {
    if (a11y_pronounceLatestOfficialFeedbackPost) {
      timeoutRef.current = setTimeout(
        () => setA11y_pronounceLatestOfficialFeedbackPost(false),
        2000
      );
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [a11y_pronounceLatestOfficialFeedbackPost]);

  const closeInitiativeSocialSharingModal = () => {
    setInitiativeIdForSocialSharing(null);
  };

  const onTranslateInitiative = () => {
    if (translateButtonClicked) {
      trackEventByName(tracks.clickGoBackToOriginalInitiativeCopyButton.name);
    } else {
      trackEventByName(tracks.clickTranslateInitiativeButton.name);
    }
    setTranslateButtonClicked(!translateButtonClicked);
  };

  const onScrollToOfficialFeedback = () => {
    const feedbackElement = document.getElementById('official-feedback-feed');
    if (feedbackElement) {
      feedbackElement.setAttribute('tabindex', '-1'); // Make the feedback element focusable

      feedbackElement.focus();
      feedbackElement.scrollIntoView({ behavior: 'smooth' });

      // Listen for focus out to restore default tabbing behavior
      feedbackElement.addEventListener('focusout', function () {
        feedbackElement.removeAttribute('tabindex');
      });

      setA11y_pronounceLatestOfficialFeedbackPost(true);
    }
  };

  return (
    <div id="e2e-initiative-show" className={className}>
      <main>
        {isSmallerThanTablet ? (
          <Phone
            initiativeId={initiativeId}
            translateButtonClicked={translateButtonClicked}
            a11y_pronounceLatestOfficialFeedbackPost={
              a11y_pronounceLatestOfficialFeedbackPost
            }
            onScrollToOfficialFeedback={onScrollToOfficialFeedback}
            onTranslateInitiative={onTranslateInitiative}
          />
        ) : (
          <LargerThanPhone
            initiativeId={initiativeId}
            translateButtonClicked={translateButtonClicked}
            a11y_pronounceLatestOfficialFeedbackPost={
              a11y_pronounceLatestOfficialFeedbackPost
            }
            onScrollToOfficialFeedback={onScrollToOfficialFeedback}
            onTranslateInitiative={onTranslateInitiative}
          />
        )}
        <Suspense fallback={<LoadingComments />}>
          <Footer postId={initiativeId} postType="initiative" />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Modals
          closeInitiativeSocialSharingModal={closeInitiativeSocialSharingModal}
          initiativeIdForSocialSharing={initiativeIdForSocialSharing}
        />
      </Suspense>
    </div>
  );
};

export default InitiativesShow;
