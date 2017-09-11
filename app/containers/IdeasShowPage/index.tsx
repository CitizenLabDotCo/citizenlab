import * as React from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import ContentContainer from 'components/ContentContainer';
import IdeasShow from 'containers/IdeasShow';

const BackgroundWrapper = styled.div`
  margin: 50px 0;

  ${media.notPhone`
    border-radius: 5px;
    background-color: #ffffff;
  `}
`;

interface Props {
  params: {
    slug: string,
    location: string,
  };
}

const IdeasShowPage: React.SFC<Props> = ({ params }) => (
  <ContentContainer>
    <BackgroundWrapper>
      <IdeasShow slug={params.slug} location={location}/>
    </BackgroundWrapper>
  </ContentContainer>
);

export default  IdeasShowPage;
