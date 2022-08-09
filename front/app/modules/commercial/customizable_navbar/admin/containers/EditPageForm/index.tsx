import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isPageInNavbar } from './utils';

// components
import EditPageFormNavbar from './EditPageFormNavbar';
import EditPageFormNotInNavbar from 'containers/Admin/pagesAndMenu/containers/EditPageForm/EditPageFormNotInNavbar';
import useFeatureFlag from 'hooks/useFeatureFlag';

const EditPageForm = ({ params: { pageId } }: WithRouterProps) => {
  const navbarItems = useNavbarItems();
  const customizableNavbarEnabled = useFeatureFlag({
    name: 'customizable_navbar',
  });
  if (isNilOrError(navbarItems)) return null;

  return isPageInNavbar(pageId, navbarItems) && customizableNavbarEnabled ? (
    <EditPageFormNavbar />
  ) : (
    <EditPageFormNotInNavbar hideSlugInput={!customizableNavbarEnabled} />
  );
};

export default withRouter(EditPageForm);
