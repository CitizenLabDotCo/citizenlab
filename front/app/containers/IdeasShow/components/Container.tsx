import React, { useState, useEffect, useRef } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isString } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';

import messages from '../messages';
import {
  pageContentMaxWidth,
  contentFadeInDuration,
  contentFadeInEasing,
  contentFadeInDelay,
} from '../styleConstants';

const Container = styled.div`
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

{
  /*
  On "Container2" naming: I didn't try to come up with a better name because this shouldn't be a separate component.
  It makes it harder to understand IdeasShow with no benefits.
  This component needs to be reintegrated into IdeasShow instead, then extract
  the modal perhaps.
*/
}
const Container2 = ({
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

  const inputTerm = getInputTerm(phases?.data);

  return (
    <>
      {!isLoaded && (
        <Container className={`loading ${className || ''}`}>
          <Spinner />
        </Container>
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
        <main id="e2e-idea-show">
          <Container
            className={`loaded ${className || ''}`}
            ref={handleContainerRef}
          >
            {children}
          </Container>
        </main>
      </CSSTransition>
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
    </>
  );
};

export default Container2;
