import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import Fragment from 'components/Fragment';
import FileAttachments from 'components/UI/FileAttachments';
import { Container, Content } from 'components/LandingPages/citizen';
import { Helmet } from 'react-helmet';
import CustomPageHeader from './CustomPageHeader';
import CustomPageProjectsAndEvents from './CustomPageProjectsAndEvents';
import InfoSection from 'components/LandingPages/citizen/InfoSection';
import AdminCustomPageEditButton from './CustomPageHeader/AdminCustomPageEditButton';
import PageNotFound from 'components/PageNotFound';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCustomPage from 'hooks/useCustomPage';
import useResourceFiles from 'hooks/useResourceFiles';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

// utils
import { isError, isNil, isNilOrError } from 'utils/helperUtils';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl, media } from 'utils/styleUtils';

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;

  ${media.tablet`
    font-size: ${fontSizes.xxxl}px;
  `}

  ${isRtl`
    text-align: right;
    direction: rtl;
  `}
`;

const AttachmentsContainer = styled(ContentContainer)<{
  topInfoSectionEnabled: boolean;
}>`
  background: #fff;
  padding-top: ${({ topInfoSectionEnabled }) =>
    topInfoSectionEnabled ? '0' : '50px'};
  padding-bottom: 50px;
  padding-left: 20px;
  padding-right: 20px;

  ${media.tablet`
    padding-top: 30px;
    padding-bottom: 30px;
  `}
`;

const NoBannerContainer = styled(ContentContainer)`
  background: #fff;
  padding: 50px 50px 50px 50px;

  ${media.tablet`
    padding: 50px 20px 50px 20px;
  `}
`;

const CustomPageShow = () => {
  const { slug } = useParams() as {
    slug: string;
  };
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();
  const page = useCustomPage({ customPageSlug: slug });
  const proposalsEnabled = useFeatureFlag({ name: 'initiatives' });
  const remotePageFiles = useResourceFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });

  // when neither have loaded
  if (isNil(page) || isNilOrError(appConfiguration)) {
    return null;
  }

  if (
    // if URL is mistyped, page is also an error
    isError(page) ||
    // If page loaded but it's /pages/initiatives but
    // the initiatives feature is not enabled also show
    // not found
    (!isError(page) &&
      page.attributes.code === 'proposals' &&
      !proposalsEnabled)
  ) {
    return <PageNotFound />;
  }

  const pageAttributes = page.attributes;
  const localizedOrgName = localize(
    appConfiguration.data.attributes.settings.core.organization_name
  );
  return (
    <Container className={`e2e-page-${slug}`}>
      <Helmet
        title={`${localize(
          pageAttributes.title_multiloc
        )} | ${localizedOrgName}`}
      />
      {pageAttributes.banner_enabled ? (
        <Box background="#fff" width="100%">
          <CustomPageHeader pageData={page} />
        </Box>
      ) : (
        <NoBannerContainer>
          {/* show page text title if the banner is disabled */}
          <PageTitle>{localize(pageAttributes.title_multiloc)}</PageTitle>
          <Box zIndex="40000">
            <AdminCustomPageEditButton pageId={page.id} />
          </Box>
        </NoBannerContainer>
      )}
      <Content>
        <Fragment
          name={!isNilOrError(page) ? `pages/${page && page.id}/content` : ''}
        />
        {pageAttributes.top_info_section_enabled && (
          <InfoSection
            multilocContent={pageAttributes.top_info_section_multiloc}
          />
        )}
        {pageAttributes.files_section_enabled &&
          !isNilOrError(remotePageFiles) &&
          remotePageFiles.length > 0 && (
            <AttachmentsContainer
              topInfoSectionEnabled={pageAttributes.top_info_section_enabled}
            >
              <FileAttachments files={remotePageFiles} />
            </AttachmentsContainer>
          )}
        <CustomPageProjectsAndEvents page={page} />
        {pageAttributes.bottom_info_section_enabled && (
          <InfoSection
            multilocContent={pageAttributes.bottom_info_section_multiloc}
          />
        )}
      </Content>
    </Container>
  );
};

export default CustomPageShow;
