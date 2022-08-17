import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Formik, FormikProps } from 'formik';

// components
import PageForm, { validatePageForm, FormValues } from 'components/PageForm';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import useLocalize from 'hooks/useLocalize';

// services
import { updatePage } from 'services/pages';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';
import { MAX_TITLE_LENGTH } from 'services/navbar';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useRemoteFiles from 'hooks/useRemoteFiles';
import usePage from 'hooks/usePage';
import usePageSlugs from 'hooks/usePageSlugs';
import { truncateMultiloc } from 'utils/textUtils';

interface Props {
  hideSlugInput?: boolean;
}

const EditPageFormNotInNavbar = ({
  hideSlugInput = false,
  params: { pageId },
  intl: { formatMessage },
}: Props & WithRouterProps & InjectedIntlProps) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const localize = useLocalize();
  const page = usePage({ pageId });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });
  const pageSlugs = usePageSlugs();

  if (
    isNilOrError(page) ||
    isNilOrError(appConfigurationLocales) ||
    isNilOrError(pageSlugs)
  ) {
    return null;
  }

  const handleSubmit = async (
    { local_page_files, ...pageUpdate }: FormValues,
    { setSubmitting, setStatus }
  ) => {
    try {
      const promises: Promise<any>[] = [updatePage(pageId, pageUpdate)];

      if (!isNilOrError(local_page_files)) {
        const addPromise = handleAddPageFiles(
          pageId,
          local_page_files,
          remotePageFiles
        );
        const removePromise = handleRemovePageFiles(
          pageId,
          local_page_files,
          remotePageFiles
        );

        promises.push(addPromise, removePromise);
      }

      await Promise.all(promises);

      setStatus('success');
      setSubmitting(false);
    } catch (error) {
      setStatus('error');
      setSubmitting(false);
    }
  };

  const renderFn = (props: FormikProps<FormValues>) => {
    return (
      <PageForm {...props} pageId={pageId} hideSlugInput={hideSlugInput} />
    );
  };

  return (
    <SectionFormWrapper
      title={localize(page.attributes.title_multiloc)}
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: localize(page.attributes.title_multiloc),
        },
      ]}
    >
      <Formik
        initialValues={{
          nav_bar_item_title_multiloc: truncateMultiloc(
            page.attributes.nav_bar_item_title_multiloc,
            MAX_TITLE_LENGTH
          ),
          title_multiloc: page.attributes.title_multiloc,
          body_multiloc: page.attributes.body_multiloc,
          slug: page.attributes.slug,
          local_page_files: remotePageFiles,
        }}
        onSubmit={handleSubmit}
        render={renderFn}
        validate={validatePageForm(
          appConfigurationLocales,
          pageSlugs,
          page.attributes.slug
        )}
        validateOnChange={false}
        validateOnBlur={false}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(withRouter(EditPageFormNotInNavbar));
