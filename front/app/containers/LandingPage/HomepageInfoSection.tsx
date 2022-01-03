import React from 'react';
import useAppConfiguration from 'hooks/useAppConfiguration';
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

const HomepageInfoSection = () => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const homepageInfoMultiloc =
      appConfiguration.data.attributes.homepage_info_multiloc;

    if (homepageInfoMultiloc && !isEmptyMultiloc(homepageInfoMultiloc)) {
      return (
        <CustomSectionContentContainer>
          <StyledQuillEditedContent>
            <Fragment name={'pages/homepage_info/content'}>
              <T value={homepageInfoMultiloc} supportHtml={true} />
            </Fragment>
          </StyledQuillEditedContent>
        </CustomSectionContentContainer>
      );
    }
  }

  return null;
};

export default HomepageInfoSection;
