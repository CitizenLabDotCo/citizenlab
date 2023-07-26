import React, { useState, useEffect, useRef } from 'react';

// api
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { getInputTermMessage } from 'utils/i18n';

// router
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// components
import { Spinner } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';

// styling
import styled from 'styled-components';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// constants
import {
  pageContentMaxWidth,
  contentFadeInDuration,
  contentFadeInEasing,
  contentFadeInDelay,
} from '../styleConstants';

// utils
import { getInputTerm } from 'services/participationContexts';
import { isString } from 'utils/helperUtils';

const Main = styled.main`
  width: 100%;
  max-width: ${pageContentMaxWidth}px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: auto;
  margin-right: auto;
  background: #fff;

  &.loading {
    flex: 1;
    justify-content: center;
  }

  &.isLoaded {
    opacity: 0;

    &.content-enter {
      opacity: 0;

      &.content-enter-active {
        opacity: 1;
        transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing}
          ${contentFadeInDelay}ms;
      }
    }

    &.content-enter-done {
      opacity: 1;
    }
  }
`;

interface Props {
  projectId: string;
  isLoaded: boolean;
  className?: string;
  children: React.ReactNode;
  handleContainerRef: (element: HTMLElement | null) => void;
}

const Container = ({
  projectId,
  isLoaded,
  className,
  children,
  handleContainerRef,
}: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { formatMessage } = useIntl();

  const [searchParams] = useSearchParams();
  const ideaIdParameter = searchParams.get('new_idea_id');
  const [newIdeaId, setNewIdeaId] = useState<string | null>(null);
  const timeout = useRef<NodeJS.Timeout>();

  const ideaflowSocialSharingIsEnabled = useFeatureFlag({
    name: 'ideaflow_social_sharing',
  });

  useEffect(() => {
    if (isString(ideaIdParameter)) {
      timeout.current = setTimeout(() => {
        setNewIdeaId(ideaIdParameter);
      }, 1500);
    }

    removeSearchParams(['new_idea_id']);
  }, [ideaIdParameter]);

  const closeIdeaSocialSharingModal = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setNewIdeaId(null);
  };

  if (!project) return null;

  const inputTerm = getInputTerm(
    project.data.attributes.process_type,
    project.data,
    phases?.data
  );

  return (
    <>
      {!isLoaded && (
        <Main className={`loading ${className || ''}`}>
          <Spinner />
        </Main>
      )}
      <CSSTransition
        classNames="content"
        in={isLoaded}
        timeout={{
          enter: contentFadeInDuration + contentFadeInDelay,
          exit: 0,
        }}
        enter={true}
        exit={false}
      >
        <Main
          id="e2e-idea-show"
          className={`loaded ${className || ''}`}
          ref={handleContainerRef}
        >
          {children}
        </Main>
      </CSSTransition>
      {ideaflowSocialSharingIsEnabled && (
        <Modal
          opened={!!newIdeaId}
          close={closeIdeaSocialSharingModal}
          hasSkipButton={true}
          skipText={<>{formatMessage(messages.skipSharing)}</>}
        >
          {newIdeaId && (
            <SharingModalContent
              postType="idea"
              postId={newIdeaId}
              title={formatMessage(
                getInputTermMessage(inputTerm, {
                  idea: messages.sharingModalTitle,
                  option: messages.optionSharingModalTitle,
                  project: messages.projectSharingModalTitle,
                  question: messages.questionSharingModalTitle,
                  issue: messages.issueSharingModalTitle,
                  contribution: messages.contributionSharingModalTitle,
                })
              )}
              subtitle={formatMessage(messages.sharingModalSubtitle)}
            />
          )}
        </Modal>
      )}
    </>
  );
};

export default Container;
