import ContentContainer from 'components/ContentContainer';
import Fragment from 'components/Fragment';
import { StyledQuillEditedContent } from 'components/LandingPages/citizen/InfoSection';
import T from 'components/T';
import React from 'react';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { isEmptyMultiloc } from 'utils/helperUtils';
import { media } from 'utils/styleUtils';

const CustomSectionContentContainer = styled(ContentContainer)`
  width: 100%;
  max-width: 750px;
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

interface Props {
  multilocContent: Multiloc;
  // pages/homepage_info/content was the previous bottom info section fragment key,
  // leaving it as such for backwards compatibility
  fragmentName:
    | 'pages/homepage_info/content'
    | 'pages/homepage_info/top-content';
}

const HomepageInfoSection = ({ multilocContent, fragmentName }: Props) => {
  if (!multilocContent || isEmptyMultiloc(multilocContent)) {
    return null;
  }

  return (
    <CustomSectionContentContainer>
      <StyledQuillEditedContent>
        <Fragment name={fragmentName}>
          <T value={multilocContent} supportHtml={true} />
        </Fragment>
      </StyledQuillEditedContent>
    </CustomSectionContentContainer>
  );
};

export default HomepageInfoSection;
