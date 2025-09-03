import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IIdeaImageData } from 'api/idea_images/types';
import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../_shared/NoData';
import { BORDER } from '../../constants';
import IdeaCard from '../../SingleIdeaWidget/IdeaCard';
import messages from '../messages';

interface Props {
  phase: IPhaseData;
  ideas: IIdeaData[];
  images: Record<string, IIdeaImageData[]>;
  collapseLongText: boolean;
}

const Ideas = ({ phase, ideas, images, collapseLongText }: Props) => {
  if (isNilOrError(ideas) || ideas.length === 0) {
    return <NoData message={messages.noIdeasAvailable} />;
  }

  return (
    <Box>
      {ideas.map((idea, i) => (
        <PageBreakBox key={i} borderTop={BORDER} my="16px" pt="16px">
          <IdeaCard
            rank={i + 1}
            idea={idea}
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            images={images[idea.id] || []}
            phase={phase}
            collapseLongText={collapseLongText}
          />
        </PageBreakBox>
      ))}
    </Box>
  );
};

export default Ideas;
