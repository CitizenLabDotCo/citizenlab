import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import HeaderContent from './HeaderContent';
import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';
import Image from 'components/UI/Image';
import { media } from 'utils/styleUtils';

const HeaderImage = styled(Image)`
  width: 100%;
  height: 280px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;

  ${media.smallerThanMaxTablet`
    height: 200px;
  `}
`;

const Container = styled.div`
  display: flex;
  flexdirection: column;
  alignitems: center;
  padding: 20px 0;

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

interface Props {}

const Layout3 = ({}: Props) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const headerImage = appConfiguration.data.attributes.header_bg?.medium;

    return (
      <>
        {headerImage && (
          <HeaderImage
            src={headerImage}
            cover={true}
            fadeIn={false}
            isLazy={false}
            placeholderBg="transparent"
            alt=""
          />
        )}
        <ContentContainer mode="page">
          <Container>
            <HeaderContent fontColors="dark" />
          </Container>
        </ContentContainer>
      </>
    );
  }

  return null;
};

export default Layout3;
