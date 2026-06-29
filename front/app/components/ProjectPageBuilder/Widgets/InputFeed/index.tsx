import React, { Suspense } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

import messages from '../messages';
import SectionBackground from '../SectionBackground';
import useCanModerateProject from '../useCanModerateProject';

import EmptyInputFeed from './EmptyInputFeed';

const PublicInputContent = React.lazy(() => import('./PublicInputContent'));

// The project's participation content (ideas / survey / voting / …). It is
// auto-injected, can be moved within the page, but cannot be deleted or
// duplicated. Its content is method-driven, so it isn't edited in the builder —
// only positioned.
//
// It renders the live content everywhere, but is made non-interactive off the
// public project route (i.e. in the builder/previews) so its URL-driven filters
// and links can't fire there.
const InputFeed: UserComponent = () => {
  const { projectId, slug } = useParams({ strict: false }) as {
    projectId?: string;
    slug?: string;
  };
  const { data: projectBySlug } = useProjectBySlug(slug);
  const projectIdToUse = projectId || projectBySlug?.data.id;
  const onPublicRoute = !!slug;
  const canModerate = useCanModerateProject(projectIdToUse);
  const { data: phases } = usePhases(projectIdToUse);
  const hasParticipation = !!phases && !!getLatestRelevantPhase(phases.data);

  return (
    <Box
      id="e2e-project-page-input-feed"
      pointerEvents={onPublicRoute ? 'auto' : 'none'}
      // Keep it selectable/movable in the builder even when there is no active
      // phase (and so no content renders).
      minHeight={onPublicRoute ? undefined : '40px'}
    >
      {projectIdToUse &&
        phases &&
        (hasParticipation ? (
          // Sits on the same grey background as the Timeline widget above it, so
          // the phases + participation content read as one section (like the old
          // page). Only wraps real content, so empty phases leave no grey strip.
          <SectionBackground $fullBleed={onPublicRoute} pb="40px">
            <Suspense fallback={null}>
              <PublicInputContent projectId={projectIdToUse} />
            </Suspense>
          </SectionBackground>
        ) : canModerate ? (
          <EmptyInputFeed />
        ) : null)}
    </Box>
  );
};

const InputFeedSettings = () => {
  const { projectId } = useParams({ strict: false }) as { projectId?: string };

  return (
    <Box my="20px">
      <Text color="textSecondary" fontSize="s">
        <FormattedMessage
          {...messages.inputFeedManagedNote}
          values={{
            projectEditorLink: projectId ? (
              <Link
                to="/admin/projects/$projectId/phases"
                params={{ projectId }}
                target="_blank"
              >
                <FormattedMessage {...messages.projectEditorLinkText} />
              </Link>
            ) : (
              <FormattedMessage {...messages.projectEditorLinkText} />
            ),
          }}
        />
      </Text>
    </Box>
  );
};

InputFeed.craft = {
  related: {
    settings: InputFeedSettings,
  },
  custom: {
    title: messages.inputFeedWidgetTitle,
    // Non-deletable (the settings panel hides Delete for locked nodes), but no
    // canDrag rule so it stays movable within the page.
    locked: true,
    noPointerEvents: true,
  },
};

export const inputFeedWidgetTitle = messages.inputFeedWidgetTitle;

export default InputFeed;
