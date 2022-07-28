import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Formik, FormikActions, FormikProps } from 'formik';

// components
import NavbarItemForm, {
  validatePageForm,
  FormValues,
} from '../../components/NavbarItemForm';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getInitialFormValues, createNavbarItemUpdateData } from './utils';

// services
import { updateNavbarItem } from '../../../services/navbar';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useNavbarItem from '../../../hooks/useNavbarItem';
import useLocalize from 'hooks/useLocalize';

const EditNavbarItemForm = ({
  params: { navbarItemId },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const navbarItem = useNavbarItem({ navbarItemId });
  const localize = useLocalize();

  if (isNilOrError(appConfigurationLocales) || isNilOrError(navbarItem)) {
    return null;
  }

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setStatus }: FormikActions<FormValues>
  ) => {
    try {
      await updateNavbarItem(
        navbarItemId,
        createNavbarItemUpdateData(navbarItem, values)
      );

      setStatus('success');
      setSubmitting(false);
    } catch (error) {
      setStatus('error');
      setSubmitting(false);
    }
  };

  const renderFn = (props: FormikProps<FormValues>) => {
    return <NavbarItemForm {...props} />;
  };

  return (
    <SectionFormWrapper
      title={localize(navbarItem.attributes.title_multiloc)}
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: localize(navbarItem.attributes.title_multiloc),
        },
      ]}
    >
      <Formik
        initialValues={getInitialFormValues(navbarItem)}
        onSubmit={handleSubmit}
        render={renderFn}
        validate={validatePageForm(appConfigurationLocales)}
        validateOnChange={false}
        validateOnBlur={false}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(withRouter(EditNavbarItemForm));
