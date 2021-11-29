import React from 'react';
import useAppConfiguration from 'hooks/useAppConfiguration';
import usePage from 'hooks/usePage';
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
  const homepageInfoPage = usePage({ pageSlug: 'homepage-info' });

  if (!isNilOrError(appConfiguration) && !isNilOrError(homepageInfoPage)) {
    // custom section
    const showCustomSection = !isEmptyMultiloc(
      homepageInfoPage.attributes.body_multiloc
    );
    const customSectionBodyMultiloc = homepageInfoPage.attributes.body_multiloc;

    if (showCustomSection) {
      return (
        <CustomSectionContentContainer>
          <StyledQuillEditedContent>
            <Fragment
              name={
                !isNilOrError(homepageInfoPage)
                  ? `pages/${homepageInfoPage && homepageInfoPage.id}/content`
                  : ''
              }
            >
              <T value={customSectionBodyMultiloc} supportHtml={true} />
            </Fragment>
          </StyledQuillEditedContent>
        </CustomSectionContentContainer>
      );
    }
  }

  return null;
};

export default HomepageInfoSection;
