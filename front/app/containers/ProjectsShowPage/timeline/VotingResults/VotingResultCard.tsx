import React from 'react';

// components
import { Box, defaultStyles } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize from 'hooks/useLocalize';

// styling
import { stylingConsts } from 'utils/styleUtils';

// typings
import { IIdeaData } from 'api/ideas/types';

interface Props {
  idea: IIdeaData;
}

const VotingResultCard = ({ idea }: Props) => {
  const localize = useLocalize();

  return (
    <Box
      p="16px"
      bgColor="white"
      w="100%"
      borderRadius={stylingConsts.borderRadius}
      boxShadow={defaultStyles.boxShadow}
    >
      {localize(idea.attributes.title_multiloc)}
    </Box>
  );
};

export default VotingResultCard;
