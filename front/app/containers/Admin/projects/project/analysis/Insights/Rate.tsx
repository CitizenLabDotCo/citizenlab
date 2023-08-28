import React, { useState } from 'react';
import {
  IconButton,
  Text,
  colors,
  Box,
  Icon,
} from '@citizenlab/cl2-component-library';

const Rate = () => {
  const [rated, setRated] = useState(false);

  return (
    <div>
      {rated ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap="8px"
        >
          <Icon fill={colors.success} name="check-circle" />
          <Text>Thank you for your feedback</Text>
        </Box>
      ) : (
        <Box>
          <Text>Rate the quality of this item</Text>
          <Box display="flex" w="100%" justifyContent="center">
            <IconButton
              iconName="vote-up"
              a11y_buttonActionMessage="Upvote"
              iconColor={colors.success}
              iconColorOnHover={colors.success}
              onClick={() => setRated(true)}
            />
            <IconButton
              iconName="vote-down"
              a11y_buttonActionMessage="Downvote"
              iconColor={colors.error}
              iconColorOnHover={colors.error}
              onClick={() => setRated(true)}
            />
          </Box>
        </Box>
      )}
    </div>
  );
};

export default Rate;
