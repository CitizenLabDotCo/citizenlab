import React from 'react';
import { withRouter, WithRouterProps } from 'utils/withRouter';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isPageInNavbar } from './utils';

// components
import EditPageFormNavbar from './EditPageFormNavbar';
import EditPageFormNotInNavbar from './EditPageFormNotInNavbar';

const EditPageForm = ({ params: { pageId } }: WithRouterProps) => {
  const navbarItems = useNavbarItems();
  if (isNilOrError(navbarItems)) return null;

  return isPageInNavbar(pageId, navbarItems) ? (
    <EditPageFormNavbar />
  ) : (
    <EditPageFormNotInNavbar />
  );
};

export default withRouter(EditPageForm);
