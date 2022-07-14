import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Formik, FormikActions, FormikProps } from 'formik';

// components
import NavbarItemForm, {
  validatePageForm,
  FormValues,
} from '../../components/NavbarItemForm';
import GoBackButton from 'components/UI/GoBackButton';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import { getInitialFormValues, createNavbarItemUpdateData } from './utils';
import { PAGES_MENU_PATH } from 'containers/Admin/pages-menu/routes';

// services
import { updateNavbarItem } from '../../../services/navbar';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useNavbarItem from '../../../hooks/useNavbarItem';

const Title = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  padding: 0;
  width: 100%;
  margin: 1rem 0 3rem 0;
`;

const EditNavbarItemForm = ({ params: { navbarItemId } }: WithRouterProps) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const navbarItem = useNavbarItem({ navbarItemId });

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

  const goBack = () => {
    clHistory.push(PAGES_MENU_PATH);
  };

  const renderFn = (props: FormikProps<FormValues>) => {
    return <NavbarItemForm {...props} />;
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <Title>
        <T value={navbarItem.attributes.title_multiloc} />
      </Title>
      <Formik
        initialValues={getInitialFormValues(navbarItem)}
        onSubmit={handleSubmit}
        render={renderFn}
        validate={validatePageForm(appConfigurationLocales)}
        validateOnChange={false}
        validateOnBlur={false}
      />
    </div>
  );
};

export default withRouter(EditNavbarItemForm);
