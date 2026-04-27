import React from 'react';

import { Box, Text, colors, Spinner } from '@citizenlab/cl2-component-library';

interface Props {
  sentinel: string | undefined;
  loadMoreRef: (node: Element | null | undefined) => void;
  isLoadingNewData: boolean;
  isFetchingNextPage: boolean;
}

const LoadingComponents = ({
  sentinel,
  loadMoreRef,
  isLoadingNewData,
  isFetchingNextPage,
}: Props) => {
  return (
    <>
      {sentinel && (
        <Box
          ref={loadMoreRef}
          mt="12px"
          display="flex"
          justifyContent="center"
          color={colors.textPrimary}
        >
          <Text>{sentinel}</Text>
        </Box>
      )}

      {isLoadingNewData && (
        <Box
          position="absolute"
          left="0"
          top="0"
          w="100%"
          h="100%"
          display="flex"
          justifyContent="center"
          pt="80px"
          bgColor={colors.white}
          opacity={0.5}
        >
          <Spinner />
        </Box>
      )}

      {isFetchingNextPage && (
        <Box
          w="100%"
          p="4px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner />
        </Box>
      )}
    </>
  );
};

export default LoadingComponents;
