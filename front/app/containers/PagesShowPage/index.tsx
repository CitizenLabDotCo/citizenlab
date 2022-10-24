import React from 'react';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { useParams } from 'react-router-dom';
import usePage from 'hooks/usePage';
import useResourceFiles from 'hooks/useResourceFiles';

// components
import { Helmet } from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import Fragment from 'components/Fragment';
import Link from 'utils/cl-router/Link';
import ResolveTextVariables from 'components/ResolveTextVariables';
import FileAttachments from 'components/UI/FileAttachments';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// i18n
import { useIntl } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// styling
import styled from 'styled-components';
import {
  colors,
  media,
  fontSizes,
  isRtl,
  defaultCardStyle,
} from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';

export const Container = styled.div`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

export const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30px;
`;

const AttachmentsContainer = styled.div`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
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

export const PageDescription = styled.div``;

export const StyledLink = styled(Link)`
  color: #666;
  font-size: ${fontSizes.l}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 20px 23px;
  ${defaultCardStyle};
  transition: all 200ms ease;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const PagesShowPage = () => {
  const { slug } = useParams() as {
    slug?: string;
  };

  const { formatMessage } = useIntl();
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const page = usePage({ pageSlug: slug });
  const pageFiles = useResourceFiles({
    resourceId: !isNilOrError(page) ? page.id : null,
    resourceType: 'page',
  });

  if (
    !isNilOrError(locale) &&
    !isNilOrError(tenantLocales) &&
    page !== undefined
  ) {
    let seoTitle: string;
    let seoDescription: string;
    let blockIndexing: boolean;
    let pageTitle: JSX.Element;
    let pageDescription: JSX.Element;
    let pageSlug: string;

    if (!isNilOrError(page)) {
      seoTitle = getLocalized(
        page.attributes.title_multiloc,
        locale,
        tenantLocales
      );
      seoDescription = '';
      blockIndexing = false;
      pageSlug = page.attributes.slug || '';
      pageTitle = <T value={page.attributes.title_multiloc} />;
      pageDescription = (
        <ResolveTextVariables value={page.attributes.top_info_section_multiloc}>
          {(multiloc) => <T value={multiloc} supportHtml={true} />}
        </ResolveTextVariables>
      );
    } else {
      seoTitle = formatMessage(messages.notFoundTitle);
      seoDescription = formatMessage(messages.notFoundDescription);
      blockIndexing = true;
      pageTitle = <FormattedMessage {...messages.notFoundTitle} />;
      pageDescription = <FormattedMessage {...messages.notFoundDescription} />;
      pageSlug = '';
    }

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
              name={
                !isNilOrError(page) ? `pages/${page && page.id}/content` : ''
              }
            >
              <PageTitle>{pageTitle}</PageTitle>
              <PageDescription>
                <QuillEditedContent>{pageDescription}</QuillEditedContent>
              </PageDescription>
            </Fragment>
          </StyledContentContainer>
          {!isNilOrError(pageFiles) && pageFiles.length > 0 && (
            <AttachmentsContainer>
              <FileAttachments files={pageFiles} />
            </AttachmentsContainer>
          )}
        </PageContent>
      </Container>
    );
  }

  return null;
};

export default PagesShowPage;
