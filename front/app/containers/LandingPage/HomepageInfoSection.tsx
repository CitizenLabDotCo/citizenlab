import React from 'react';
import { isEmptyMultiloc } from 'utils/helperUtils';
import T from 'components/T';
import ContentContainer from 'components/ContentContainer';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Fragment from 'components/Fragment';

// typings
import { Multiloc } from 'typings';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const CustomSectionContentContainer = styled(ContentContainer)`
  width: 100%;
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 80px;
  padding-bottom: 80px;
  background: #fff;

  ${media.smallerThanMinTablet`
    padding-top: 40px;
    padding-bottom: 40px;
  `}
`;

const StyledQuillEditedContent = styled(QuillEditedContent)`
  h1,
  h2 {
    color: ${(props) => props.theme.colorText};
  }

  p,
  li {
    color: ${colors.label};
  }
`;

type Props = {
  multilocContent: Multiloc;
  // pages/homepage_info/content was the previous bottom info section fragment key,
  // leaving it as such for backwards compatibility
  fragmentName:
    | 'pages/homepage_info/content'
    | 'pages/homepage_info/top-content';
  testId?: string;
};

const HomepageInfoSection = ({ multilocContent, fragmentName, testId }: Props) => {
  if (!multilocContent || isEmptyMultiloc(multilocContent)) {
    return null;
  }

  return (
    <CustomSectionContentContainer testId={testId}>
      <StyledQuillEditedContent>
        <Fragment name={fragmentName}>
          <T value={multilocContent} supportHtml={true} />
        </Fragment>
      </StyledQuillEditedContent>
    </CustomSectionContentContainer>
  );
};

export default HomepageInfoSection;
