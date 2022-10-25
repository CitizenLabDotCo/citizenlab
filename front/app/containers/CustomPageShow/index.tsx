import React from 'react';

// components
import PageNotFound from 'components/PageNotFound';
import ContentContainer from 'components/ContentContainer';
import Fragment from 'components/Fragment';
import FileAttachments from 'components/UI/FileAttachments';
import { Container, Content } from 'components/LandingPages/citizen';
import { Helmet } from 'react-helmet';
import CustomPageHeader from './CustomPageHeader';
import TopInfoSection from './TopInfoSection';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useCustomPage from 'hooks/useCustomPage';
import useResourceFiles from 'hooks/useResourceFiles';
import { useParams } from 'react-router-dom';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import useLocalize from 'hooks/useLocalize';
import { injectIntl } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl, media } from 'utils/styleUtils';

export const PageTitle = styled.h1`
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
  const page = useCustomPage({ customPageSlug: slug });

  const remotePageFiles = useResourceFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });

  if (isNilOrError(page) || isNilOrError(appConfiguration)) {
    return <PageNotFound />;
  }

  const pageAttributes = page.attributes;
  const localizedOrgName = localize(
    appConfiguration.attributes.settings.core.organization_name
  );
  return (
    <Container className={`e2e-custom-page`}>
      <Helmet
        title={`${localize(
          pageAttributes.title_multiloc
        )} | ${localizedOrgName}`}
      />
      {pageAttributes.banner_enabled && <CustomPageHeader pageData={page} />}
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
          <TopInfoSection
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
      </Content>
    </Container>
  );
};

export default injectIntl(CustomPageShow);
