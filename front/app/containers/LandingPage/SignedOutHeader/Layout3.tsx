import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import HeaderContent from './HeaderContent';
import { Box } from 'cl2-component-library';
import ContentContainer from 'components/ContentContainer';

interface Props {}

const Layout3 = ({}: Props) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const headerImage = appConfiguration.data.attributes.header_bg?.medium;

    return (
      <ContentContainer mode="banner">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding="50px"
        >
          {headerImage && (
            <Box as="img" width="100%" height="200px" src={headerImage} />
          )}
          <HeaderContent fontColors="dark" />
        </Box>
      </ContentContainer>
    );
  }

  return null;
};

export default Layout3;
