import React from 'react';

// components
import CustomPageHeader from './CustomPageHeader';
// import TopInfoSection from './TopInfoSection';
import { Container } from 'containers/LandingPage';
import { Helmet } from 'react-helmet';
import Fragment from 'components/Fragment';
import ContentContainer from 'components/ContentContainer';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// hooks
import usePage from 'hooks/usePage';
import { useParams } from 'react-router-dom';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import useLocalize from 'hooks/useLocalize';
import T from 'components/T';

// services
import { ICustomPageAttributes } from 'services/customPages';

// styling
import styled from 'styled-components';
import { media, fontSizes, isRtl } from 'utils/styleUtils';
import ResolveTextVariables from 'components/ResolveTextVariables';

export const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30px;
`;

export const PageContent = styled.main`
  flex-shrink: 0;
  flex-grow: 1;
  background: #fff;
  padding-top: 60px;
  padding-bottom: 100px;
`;

export const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-top: 0px;
  padding-bottom: 40px;

  ${media.tablet`
    font-size: ${fontSizes.xxxl};
  `}
  ${isRtl`
    text-align: right;
    direction: rtl;
  `}
`;

const CustomPageShow = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const { slug } = useParams() as {
    slug: string;
  };
  const page = usePage({ pageSlug: slug });
  const localize = useLocalize();

  if (isNilOrError(page)) {
    return null;
  }

  let seoTitle: string;
  let seoDescription: string;
  let blockIndexing: boolean;
  let pageTitle: string;
  let pageDescription: JSX.Element;
  let pageSlug: string;

  if (!isNilOrError(page)) {
    seoTitle = localize(page.attributes.title_multiloc);
    seoDescription = '';
    blockIndexing = false;
    pageSlug = page.attributes.slug || '';
    pageTitle = localize(page.attributes.title_multiloc);
    pageDescription = (
      <ResolveTextVariables value={page.attributes.top_info_section_multiloc}>
        {(multiloc) => <T value={multiloc} supportHtml={true} />}
      </ResolveTextVariables>
    );
  } else {
    seoTitle = formatMessage(messages.notFoundTitle);
    seoDescription = formatMessage(messages.notFoundDescription);
    blockIndexing = true;
    pageTitle = formatMessage(messages.notFoundTitle);
    pageDescription = <FormattedMessage {...messages.notFoundDescription} />;
    pageSlug = '';
  }

  const attributes = page.attributes as unknown as ICustomPageAttributes;
  return (
    <Container className={`e2e-page-${pageSlug}`}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {blockIndexing && <meta name="robots" content="noindex" />}
      </Helmet>
      <PageContent>
        <StyledContentContainer>
          <Fragment
            name={!isNilOrError(page) ? `pages/${page && page.id}/content` : ''}
          >
            <PageTitle>{pageTitle}</PageTitle>
            <CustomPageHeader
              headerLayout={attributes.banner_layout}
              header_bg={attributes.header_bg}
              headerMultiloc={attributes.banner_header_multiloc}
              subheaderMultiloc={attributes.banner_subheader_multiloc}
              headerColor={attributes.banner_overlay_color}
              headerOpacity={attributes.banner_overlay_opacity}
            />
            {attributes.top_info_section_enabled && (
              <div>
                <QuillEditedContent>{pageDescription}</QuillEditedContent>
              </div>
            )}
          </Fragment>
        </StyledContentContainer>
        {/* {!isNilOrError(pageFiles) && pageFiles.length > 0 && (
          <AttachmentsContainer>
            <FileAttachments files={pageFiles} />
          </AttachmentsContainer>
        )} */}
      </PageContent>
    </Container>
  );
};

export default injectIntl(CustomPageShow);
