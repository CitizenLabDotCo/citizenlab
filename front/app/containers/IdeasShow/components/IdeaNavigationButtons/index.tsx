import React, { useEffect, useState } from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useMiniatureIdeas from 'api/ideas/useMiniatureIdeas';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

type Props = {
  projectId: string;
  phaseContext: string;
};

const IdeaNavigationButtons = ({ projectId, phaseContext }: Props) => {
  const { formatMessage } = useIntl();
  const { slug } = useParams() as { slug: string };
  const { data: idea } = useIdeaBySlug(slug);

  const { data: ideasList } = useMiniatureIdeas({
    projects: [projectId],
    phase: phaseContext,
    sort: 'trending',
  });

  const [ideaIndex, setIdeaIndex] = useState<number | undefined>(undefined);
  const [nextIdeaSlug, setNextIdeaSlug] = useState<string | undefined>(
    undefined
  );
  const [previousIdeaSlug, setPreviousIdeaSlug] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const index = ideasList?.data.findIndex(
      (miniIdea) => miniIdea.id === idea?.data.id
    );
    const ideaListLength = ideasList?.data.length;

    if (typeof index === 'number' && index !== -1 && ideaListLength) {
      setIdeaIndex(index + 1); // Add 1 so the count in the UI displays correctly

      // Set the slugs for the next and previous idea buttons
      if (index + 1 < ideaListLength) {
        // Has next ideas
        setNextIdeaSlug(ideasList?.data[index + 1]?.attributes.slug || '');
      } else {
        setNextIdeaSlug(undefined);
      }

      if (index - 1 >= 0) {
        // Has previous ideas
        setPreviousIdeaSlug(ideasList?.data[index - 1]?.attributes.slug || '');
      } else {
        setPreviousIdeaSlug(undefined);
      }
    }
  }, [idea?.data.id, ideasList?.data]);

  if (ideaIndex) {
    return (
      <Box alignContent="center" display="flex" justifyContent="space-between">
        <Button
          px="12px"
          iconSize="16px"
          icon="chevron-left"
          buttonStyle="secondary-outlined"
          disabled={!previousIdeaSlug}
          onClick={() => {
            clHistory.replace(
              `/ideas/${previousIdeaSlug}?phase_context=${phaseContext}`
            );
          }}
        />
        <Text
          color="coolGrey600"
          aria-label={formatMessage(messages.ideaIndexAriaMessage, {
            currentIndex: ideaIndex,
            totalInputs: ideasList?.data.length || 0,
          })}
        >
          {ideaIndex}/{ideasList?.data.length}
        </Text>
        <Button
          px="12px"
          iconSize="16px"
          icon="chevron-right"
          buttonStyle="secondary-outlined"
          disabled={!nextIdeaSlug}
          onClick={() => {
            clHistory.replace(
              `/ideas/${nextIdeaSlug}?phase_context=${phaseContext}`
            );
          }}
        />
      </Box>
    );
  }

  return null;
};

export default IdeaNavigationButtons;
