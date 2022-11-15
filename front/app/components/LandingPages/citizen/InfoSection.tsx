import QuillEditedContent from 'components/UI/QuillEditedContent';
import { colors } from 'utils/styleUtils';
import ContentContainer from 'components/ContentContainer';
import Fragment from 'components/Fragment';
import T from 'components/T';
import React from 'react';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { isEmptyMultiloc } from 'utils/helperUtils';
import { media } from 'utils/styleUtils';
import ResolveTextVariables from 'components/ResolveTextVariables';

const StyledQuillEditedContent = styled(QuillEditedContent)`
  h1,
  h2 {
    color: ${(props) => props.theme.colors.tenantText};
  }

  p,
  li {
    color: ${colors.textSecondary};
  }
`;

const StyledContentContainer = styled(ContentContainer)`
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
  fragmentName?:
    | 'pages/homepage_info/content'
    | 'pages/homepage_info/top-content';
}

const InfoSection = ({ multilocContent, fragmentName }: Props) => {
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
    <StyledContentContainer>
      <StyledQuillEditedContent>
        {fragmentName ? (
          <Fragment name={fragmentName}>{pageContent}</Fragment>
        ) : (
          pageContent
        )}
      </StyledQuillEditedContent>
    </StyledContentContainer>
  );
};

export default InfoSection;
