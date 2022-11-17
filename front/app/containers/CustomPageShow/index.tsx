import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import Fragment from 'components/Fragment';
import FileAttachments from 'components/UI/FileAttachments';
import { Container, Content } from 'components/LandingPages/citizen';
import { Helmet } from 'react-helmet';
import CustomPageHeader from './CustomPageHeader';
import InfoSection from 'components/LandingPages/citizen/InfoSection';
import AdminCustomPageEditButton from './CustomPageHeader/AdminCustomPageEditButton';
import PageNotFound from 'components/PageNotFound';
import { Box } from '@citizenlab/cl2-component-library';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useCustomPage from 'hooks/useCustomPage';
import useResourceFiles from 'hooks/useResourceFiles';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';
import useAdminPublications from 'hooks/useAdminPublications';

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
  padding-top: 50px;

  ${media.tablet`
    font-size: ${fontSizes.xxxl};
  `}
  ${isRtl`
    text-align: right;
    direction: rtl;
  `}
`;

const AttachmentsContainer = styled(ContentContainer)`
  margin-bottom: 30px;
`;

const CustomPageShow = () => {
  const { slug } = useParams() as {
    slug: string;
  };
  const appConfiguration = useAppConfiguration();
  const localize = useLocalize();
  const page = useCustomPage({ customPageSlug: slug });
  const proposalsEnabled = useFeatureFlag({ name: 'initiatives' });
  const remotePageFiles = useResourceFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });
  const topicIds = !isNilOrError(page)
    ? page.relationships.topics?.data.map((topic) => topic.id)
    : null;
  const areaIds = !isNilOrError(page)
    ? page.relationships.areas?.data.map((area) => area.id)
    : null;
  const adminPublications = useAdminPublications({
    topicFilter: topicIds,
    areaFilter: areaIds,
    publicationStatusFilter: ['published', 'archived'],
  });
  const projectIds = !isNilOrError(adminPublications.list)
    ? adminPublications.list.map(
        (adminPublication) => adminPublication.relationships.publication.data.id
      )
    : [];

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
    appConfiguration.attributes.settings.core.organization_name
  );
  return (
    <Container className={`e2e-page-${slug}`}>
      <Helmet
        title={`${localize(
          pageAttributes.title_multiloc
        )} | ${localizedOrgName}`}
      />
      {pageAttributes.banner_enabled ? (
        <CustomPageHeader pageData={page} />
      ) : (
        <Box zIndex="4">
          <AdminCustomPageEditButton pageId={page.id} />
        </Box>
      )}
      <Content>
        <Fragment
          name={!isNilOrError(page) ? `pages/${page && page.id}/content` : ''}
        />
        {/* show page text title if the banner is disabled */}
        {!pageAttributes.banner_enabled && (
          <ContentContainer>
            <PageTitle>{localize(pageAttributes.title_multiloc)}</PageTitle>
          </ContentContainer>
        )}
        {pageAttributes.top_info_section_enabled && (
          <InfoSection
            multilocContent={pageAttributes.top_info_section_multiloc}
          />
        )}
        {pageAttributes.files_section_enabled &&
          !isNilOrError(remotePageFiles) &&
          remotePageFiles.length > 0 && (
            <AttachmentsContainer>
              <FileAttachments files={remotePageFiles} />
            </AttachmentsContainer>
          )}
        {pageAttributes.events_widget_enabled && (
          <ContentContainer>
            <EventsWidget projectIds={projectIds} />
          </ContentContainer>
        )}
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
