import React from 'react';
import { isEmptyMultiloc } from 'utils/helperUtils';
import T from 'components/T';

// typings
import { Multiloc } from 'typings';
import { StyledQuillEditedContent } from 'containers/LandingPage/HomepageInfoSection';

// components
import ContentContainer from 'components/ContentContainer';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

export const StyledTopInfoSectionContainer = styled(ContentContainer)`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-top: 80px;
  padding-bottom: 80px;
  background: #fff;

  ${media.phone`
    padding-top: 40px;
    padding-bottom: 40px;
  `}
`;

type Props = {
  multilocContent: Multiloc;
};

const CustomPageTopInfoSection = ({ multilocContent }: Props) => {
  if (!multilocContent || isEmptyMultiloc(multilocContent)) {
    return null;
  }

  return (
    <StyledTopInfoSectionContainer>
      <StyledQuillEditedContent>
        <T value={multilocContent} supportHtml={true} />
      </StyledQuillEditedContent>
    </StyledTopInfoSectionContainer>
  );
};

export default CustomPageTopInfoSection;
