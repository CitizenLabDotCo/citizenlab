import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import NavbarItemForm, { FormValues } from '../../components/NavbarItemForm';
import GoBackButton from 'components/UI/GoBackButton';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import { getInitialFormValues, createNavbarItemUpdateData } from './utils';
import { NAVIGATION_PATH } from '..';

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

  const handleSubmit = async (values: FormValues) => {
    await updateNavbarItem(
      navbarItemId,
      createNavbarItemUpdateData(navbarItem, values)
    );
  };

  const goBack = () => {
    clHistory.push(NAVIGATION_PATH);
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <Title>
        <T value={navbarItem.attributes.title_multiloc} />
      </Title>
      <NavbarItemForm
        defaultValues={getInitialFormValues(navbarItem)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default withRouter(EditNavbarItemForm);
