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
      <ContentContainer mode="page">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding="50px 0"
        >
          {headerImage && <Box as="img" maxHeight="200px" src={headerImage} />}
          <HeaderContent fontColors="dark" />
        </Box>
      </ContentContainer>
    );
  }

  return null;
};

export default Layout3;
