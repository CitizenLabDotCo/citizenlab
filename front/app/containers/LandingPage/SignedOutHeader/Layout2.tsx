import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useWindowSize from 'hooks/useWindowSize';
import HeaderContent from './HeaderContent';
import { Box } from 'cl2-component-library';
import ContentContainer from 'components/ContentContainer';

interface Props {}

const Layout2 = ({}: Props) => {
  const appConfiguration = useAppConfiguration();
  const { windowWidth } = useWindowSize();
  // 1200 to be replaced by viewporth constant from styleUtils
  const smallerThan1200px = windowWidth <= 1200;

  if (!isNilOrError(appConfiguration)) {
    const headerImage = appConfiguration.data.attributes.header_bg?.medium;

    return (
      <ContentContainer mode="page">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          padding="50px 0"
          flexDirection={smallerThan1200px ? 'column' : 'row'}
        >
          {headerImage && (
            <Box as="img" width="600px" height="100%" src={headerImage} />
          )}
          <HeaderContent fontColors="dark" />
        </Box>
      </ContentContainer>
    );
  }

  return null;
};

export default Layout2;
