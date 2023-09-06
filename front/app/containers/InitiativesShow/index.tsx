import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// router
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import InitiativeMeta from './InitiativeMeta';
const Modals = lazy(() => import('./modals'));
import Phone from './Phone';
import LargerThanPhone from './LargerThanPhone';
import Footer from 'components/PostShowComponents/Footer';
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';

export const contentFadeInDuration = 250;
export const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
export const contentFadeInDelay = 150;

interface Props {
  initiativeId: string;
  className?: string;
}

const InitiativesShow = ({ initiativeId }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const [searchParams] = useSearchParams();
  const newInitiativeId = searchParams.get('new_initiative_id');

  const [initiativeIdForSocialSharing, setInitiativeIdForSocialSharing] =
    useState<string | null>(null);
  const [translateButtonClicked, setTranslateButtonClicked] = useState(false);
  const [
    a11y_pronounceLatestOfficialFeedbackPost,
    setA11y_pronounceLatestOfficialFeedbackPost,
  ] = useState(false);

  const officialFeedbackElement = useRef<HTMLDivElement>(null);
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
    if (officialFeedbackElement.current) {
      officialFeedbackElement.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }

    setA11y_pronounceLatestOfficialFeedbackPost(true);
  };

  return (
    <Box id="e2e-initiative-show">
      <InitiativeMeta initiativeId={initiativeId} />
      {isSmallerThanPhone ? (
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
      <Suspense fallback={null}>
        <Modals
          closeInitiativeSocialSharingModal={closeInitiativeSocialSharingModal}
          initiativeIdForSocialSharing={initiativeIdForSocialSharing}
        />
      </Suspense>
    </Box>
  );
};

export default InitiativesShow;
