import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Formik, FormikProps } from 'formik';

// components
import PageFormWithNavbarNameField, {
  validatePageForm,
  FormValues,
} from '../../components/PageFormWithNavbarNameField';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getInitialFormValues, createPageUpdateData } from './utils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// services
import { updatePage } from 'services/pages';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useRemoteFiles from 'hooks/useRemoteFiles';
import usePage from 'hooks/usePage';
import usePageSlugs from 'hooks/usePageSlugs';
import useLocalize from 'hooks/useLocalize';

const EditPageFormNavbar = ({
  params: { pageId },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
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
    values: FormValues,
    { setSubmitting, setStatus }
  ) => {
    const localPageFiles = values.local_page_files;

    try {
      const promises: Promise<any>[] = [
        updatePage(pageId, createPageUpdateData(page, values)),
      ];

      if (!isNilOrError(localPageFiles)) {
        const addPromise = handleAddPageFiles(
          pageId,
          localPageFiles,
          remotePageFiles
        );
        const removePromise = handleRemovePageFiles(
          pageId,
          localPageFiles,
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
    return <PageFormWithNavbarNameField {...props} pageId={pageId} />;
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
        initialValues={getInitialFormValues(page, remotePageFiles)}
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

export default injectIntl(withRouter(EditPageFormNavbar));
