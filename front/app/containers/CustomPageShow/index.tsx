import React from 'react';

// components
import CustomPageHeader from './CustomPageHeader';
import TopInfoSection from './TopInfoSection';
import { Container, Content } from 'containers/LandingPage';
import { Helmet } from 'react-helmet';
import Fragment from 'components/Fragment';
import FileAttachments from 'components/UI/FileAttachments';
import ContentContainer from 'components/ContentContainer';

// hooks
import { useParams } from 'react-router-dom';
import useCustomPageBySlug from 'hooks/useCustomPageBySlug';
import useResourceFiles from 'hooks/useResourceFiles';
import useAppConfiguration from 'hooks/useAppConfiguration';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// styling
import styled from 'styled-components';
import { media, fontSizes, isRtl } from 'utils/styleUtils';

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-top: 50px;

  ${media.tablet`
    font-size: ${fontSizes.xxxl};
  `}
  ${isRtl`
    text-align: right;
    direction: rtl;
  `}
`;

const AttachmentsContainer = styled.div`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
`;

const CustomPageShow = () => {
  const appConfiguration = useAppConfiguration();
  const localize = useLocalize();

  const { slug } = useParams() as {
    slug: string;
  };
  const page = useCustomPageBySlug(slug);

  const remotePageFiles = useResourceFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });

  if (isNilOrError(page) || isNilOrError(appConfiguration)) {
    return null;
    // should return 404 here
  }

  const attributes = page.attributes;
  const localizedOrgName = localize(
    appConfiguration.attributes.settings.core.organization_name
  );
  return (
    <Container className={`e2e-custom-page`}>
      <Helmet
        title={`${localize(attributes.title_multiloc)} | ${localizedOrgName}`}
      />
      {attributes.banner_enabled && (
        <CustomPageHeader
          headerLayout={attributes.banner_layout}
          header_bg={attributes.header_bg}
          headerMultiloc={attributes.banner_header_multiloc}
          subheaderMultiloc={attributes.banner_subheader_multiloc}
          headerColor={attributes.banner_overlay_color}
          headerOpacity={attributes.banner_overlay_opacity}
          ctaButtonType={attributes.banner_cta_button_type}
          ctaButtonMultiloc={attributes.banner_cta_button_multiloc}
          ctaButtonUrl={attributes.banner_cta_button_url}
        />
      )}
      <Content>
        <Fragment
          name={!isNilOrError(page) ? `pages/${page && page.id}/content` : ''}
        />
        {/* show page text title if the banner is disabled */}
        {!attributes.banner_enabled && (
          <ContentContainer>
            <PageTitle>{localize(attributes.title_multiloc)}</PageTitle>
          </ContentContainer>
        )}
        {attributes.top_info_section_enabled && (
          <TopInfoSection
            multilocContent={attributes.top_info_section_multiloc}
          />
        )}
        {attributes.files_section_enabled &&
          !isNilOrError(remotePageFiles) &&
          remotePageFiles.length > 0 && (
            <AttachmentsContainer>
              <FileAttachments files={remotePageFiles} />
            </AttachmentsContainer>
          )}
      </Content>
    </Container>
  );
};

export default injectIntl(CustomPageShow);
