import React, { PureComponent, Suspense, lazy } from 'react';
import { adopt } from 'react-adopt';
import { isUndefined } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Helmet } from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import { Icon, Spinner } from 'cl2-component-library';
import Fragment from 'components/Fragment';
import FileAttachments from 'components/UI/FileAttachments';
import QuillEditedContent from 'components/UI/QuillEditedContent';
const PagesFooterNavigation = lazy(() =>
  import('containers/PagesShowPage/PagesFooterNavigation')
);

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import GetPageLinks, { GetPageLinksChildProps } from 'resources/GetPageLinks';
import GetResourceFiles, {
  GetResourceFilesChildProps,
} from 'resources/GetResourceFiles';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import T from 'components/T';
import messages from './messages';

// styling
import styled from 'styled-components';
import { media, colors, fontSizes, defaultCardStyle } from 'utils/styleUtils';
import ResolveTextVariables from 'components/ResolveTextVariables';

export const Container = styled.div`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
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
  padding-bottom: 60px;
`;

export const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-top: 0px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl};
  `}
`;

export const PageDescription = styled.div``;

export const StyledLink = styled(Link)`
  color: #666;
  font-size: ${fontSizes.large}px;
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

export const LinkIcon = styled(Icon)`
  width: 13px;
  height: 13px;
`;

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
  page: GetPageChildProps;
  pageFiles: GetResourceFilesChildProps;
  pageLinks: GetPageLinksChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PagesShowPage extends PureComponent<
  Props & WithRouterProps & InjectedIntlProps,
  State
> {
  render() {
    const { formatMessage } = this.props.intl;
    const { locale, tenantLocales, page, pageFiles, pageLinks } = this.props;

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenantLocales) &&
      !isUndefined(page) &&
      !isUndefined(pageLinks)
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
        pageSlug = page.attributes.slug;
        pageTitle = <T value={page.attributes.title_multiloc} />;
        pageDescription = (
          <ResolveTextVariables value={page.attributes.body_multiloc}>
            {(multiloc) => <T value={multiloc} supportHtml={true} />}
          </ResolveTextVariables>
        );
      } else {
        seoTitle = formatMessage(messages.notFoundTitle);
        seoDescription = formatMessage(messages.notFoundDescription);
        blockIndexing = true;
        pageTitle = <FormattedMessage {...messages.notFoundTitle} />;
        pageDescription = (
          <FormattedMessage {...messages.notFoundDescription} />
        );
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

          <Suspense fallback={<Spinner />}>
            <PagesFooterNavigation currentPageSlug={pageSlug} />
          </Suspense>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locale: <GetLocale />,
  tenantLocales: <GetAppConfigurationLocales />,
  page: ({ params, render }) => <GetPage slug={params.slug}>{render}</GetPage>,
  pageFiles: ({ page, render }) => (
    <GetResourceFiles
      resourceId={!isNilOrError(page) ? page.id : null}
      resourceType="page"
    >
      {render}
    </GetResourceFiles>
  ),
  pageLinks: ({ page, render }) => (
    <GetPageLinks pageId={!isNilOrError(page) ? page.id : null}>
      {render}
    </GetPageLinks>
  ),
});

const PagesShowPageWithHOCs = injectIntl<InputProps & WithRouterProps>(
  PagesShowPage
);

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <PagesShowPageWithHOCs {...inputProps} {...dataProps} />}
  </Data>
));
