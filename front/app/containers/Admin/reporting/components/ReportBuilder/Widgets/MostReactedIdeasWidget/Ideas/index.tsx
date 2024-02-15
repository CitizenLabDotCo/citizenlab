import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import IdeaCard from '../../SingleIdeaWidget/IdeaCard';
import NoData from '../../_shared/NoData';

// i18n
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { IIdeaData } from 'api/ideas/types';
import { IIdeaImageData } from 'api/idea_images/types';
import { IPhaseData } from 'api/phases/types';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import { BORDER } from '../../constants';

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
