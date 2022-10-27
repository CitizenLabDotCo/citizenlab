import React from 'react';
import { isEmptyMultiloc } from 'utils/helperUtils';

// i18n
import ResolveTextVariables from 'components/ResolveTextVariables';
import T from 'components/T';

// typings
import { StyledQuillEditedContent } from 'components/LandingPages/citizen/InfoSection';
import { Multiloc } from 'typings';

// components
import ContentContainer from 'components/ContentContainer';

// style
import styled from 'styled-components';

export const StyledTopInfoSectionContainer = styled(ContentContainer)`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-top: 40px;
  padding-bottom: 40px;
  background: #fff;
`;

type Props = {
  multilocContent: Multiloc;
};

const CustomPageTopInfoSection = ({ multilocContent }: Props) => {
  if (!multilocContent || isEmptyMultiloc(multilocContent)) {
    return null;
  }

  // needed for backwards compatibility with old-style custom pages
  // see PagesShowPage/index.tsx on an older commit for more info
  // this won't be needed for bottom info section
  const pageContent = (
    <ResolveTextVariables value={multilocContent}>
      {(multiloc) => <T value={multiloc} supportHtml={true} />}
    </ResolveTextVariables>
  );

  return (
    <StyledTopInfoSectionContainer>
      <StyledQuillEditedContent>{pageContent}</StyledQuillEditedContent>
    </StyledTopInfoSectionContainer>
  );
};

export default CustomPageTopInfoSection;
