import React from 'react';

// components
import CustomPageHeader from './CustomPageHeader';
import TopInfoSection from './TopInfoSection';
import { Container } from 'containers/LandingPage';
import { Helmet } from 'react-helmet';
import Fragment from 'components/Fragment';
import FileAttachments from 'components/UI/FileAttachments';
import {
  StyledContentContainer,
  AttachmentsContainer,
  PageContent,
} from 'containers/PagesShowPage';

// hooks
import { useParams } from 'react-router-dom';
import useCustomPageBySlug from 'hooks/useCustomPageBySlug';
import useResourceFiles from 'hooks/useResourceFiles';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

const CustomPageShow = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const { slug } = useParams() as {
    slug: string;
  };

  const page = useCustomPageBySlug(slug);
  const remotePageFiles = useResourceFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });
  const localize = useLocalize();

  if (isNilOrError(page)) {
    return null;
  }

  let seoTitle: string;
  let seoDescription: string;
  let blockIndexing: boolean;
  let pageSlug: string;

  if (!isNilOrError(page)) {
    seoTitle = localize(page.attributes.title_multiloc);
    seoDescription = '';
    blockIndexing = false;
    pageSlug = page.attributes.slug || '';
  } else {
    seoTitle = formatMessage(messages.notFoundTitle);
    seoDescription = formatMessage(messages.notFoundDescription);
    blockIndexing = true;
    pageSlug = '';
  }

  const attributes = page.attributes;
  return (
    <Container className={`e2e-page-${pageSlug}`}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {blockIndexing && <meta name="robots" content="noindex" />}
      </Helmet>
      <CustomPageHeader
        headerLayout={attributes.banner_layout}
        header_bg={attributes.header_bg}
        headerMultiloc={attributes.banner_header_multiloc}
        subheaderMultiloc={attributes.banner_subheader_multiloc}
        headerColor={attributes.banner_overlay_color}
        headerOpacity={attributes.banner_overlay_opacity}
      />
      <PageContent>
        <StyledContentContainer>
          <Fragment
            name={!isNilOrError(page) ? `pages/${page && page.id}/content` : ''}
          ></Fragment>
        </StyledContentContainer>
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
      </PageContent>
    </Container>
  );
};

export default injectIntl(CustomPageShow);
