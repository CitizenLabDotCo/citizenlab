import React from 'react';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';
import T from 'components/T';
import ContentContainer from 'components/ContentContainer';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Fragment from 'components/Fragment';

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
  sectionMultilocKey:
    | 'top_info_section_multiloc'
    | 'bottom_info_section_multiloc';
  // pages/homepage_info/content was the previous bottom info section fragment key,
  // leaving it as such for backwards compatibility
  fragmentName:
    | 'pages/homepage_info/content'
    | 'pages/homepage_info/top-content';
};

const HomepageInfoSection = ({ sectionMultilocKey, fragmentName }: Props) => {
  const homepageSettings = useHomepageSettings();
  if (!isNilOrError(homepageSettings)) {
    const sectionMultilocContent =
      homepageSettings.data.attributes[sectionMultilocKey];

    if (sectionMultilocContent && !isEmptyMultiloc(sectionMultilocContent)) {
      return (
        <CustomSectionContentContainer>
          <StyledQuillEditedContent>
            <Fragment name={fragmentName}>
              <T value={sectionMultilocContent} supportHtml={true} />
            </Fragment>
          </StyledQuillEditedContent>
        </CustomSectionContentContainer>
      );
    }
  }

  return null;
};

export default HomepageInfoSection;
