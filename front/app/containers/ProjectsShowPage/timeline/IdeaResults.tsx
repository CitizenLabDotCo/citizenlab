import React, { useMemo } from 'react';

// api
import useIdeas from 'api/ideas/useIdeas';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { IIdeaData } from 'api/ideas/types';

interface Props {
  phaseId: string;
}

const IdeaResults = ({ phaseId }: Props) => {
  const { data: ideas } = useIdeas({
    phase: phaseId,
    sort: 'baskets_count', // TODO: replace with votes_count when implemented by James
  });
  const smallerThanPhone = useBreakpoint('phone');
  const localize = useLocalize();

  const desktopRows = useMemo(() => {
    if (!ideas || smallerThanPhone) return;

    const columns: IIdeaData[][] = [];

    for (let i = 0; i < ideas.data.length; i = i + 2) {
      const ideaLeft = ideas.data[i];
      const ideaRight: IIdeaData | undefined = ideas.data[i + 1];

      if (ideaRight) {
        columns.push([ideaLeft, ideaRight]);
      } else {
        columns.push([ideaLeft]);
      }
    }

    return columns;
  }, [ideas, smallerThanPhone]);

  return (
    <Box mt="20px">
      {smallerThanPhone
        ? ideas?.data.map((idea) => (
            <Box p="20px" bgColor="white" mt="20px" key={idea.id}>
              {localize(idea.attributes.title_multiloc)}
            </Box>
          ))
        : desktopRows?.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              display="flex"
              w="100%"
              mt="20px"
              justifyContent="space-between"
            >
              {row.map((idea) => (
                <Box p="20px" bgColor="white" key={idea.id}>
                  {localize(idea.attributes.title_multiloc)}
                </Box>
              ))}
            </Box>
          ))}
    </Box>
  );
};

export default IdeaResults;
