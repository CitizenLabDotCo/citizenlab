import React from 'react';
import { useTheme } from 'styled-components';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SectionFormWrapper from '../../components/SectionFormWrapper';
// import Error from 'components/UI/Error';

// i18n
import messages from './messages';
import useLocalize from 'hooks/useLocalize';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import useCustomPage from 'hooks/useCustomPage';

// typings
// import { Multiloc, CLError } from 'typings';

// hooks
import { useParams } from 'react-router-dom';

// constants
import { PAGES_MENU_CUSTOM_PATH } from '../../routes';
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';

// utils
import { isNilOrError } from 'utils/helperUtils';

const AttachmentsForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const theme: any = useTheme();
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  if (isNilOrError(customPage)) {
    return null;
  }

  return (
    <SectionFormWrapper
      title={formatMessage(messages.pageTitle)}
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: localize(customPage.attributes.title_multiloc),
          linkTo: `${PAGES_MENU_CUSTOM_PATH}/${customPageId}/content`,
        },
        {
          label: formatMessage(messages.pageTitle),
        },
      ]}
    >
      <Box maxWidth={`${theme.maxPageWidth - 100}px`} mb="24px" />
      {/* <Error apiErrors={apiErrors} /> */}
    </SectionFormWrapper>
  );
};

export default injectIntl(AttachmentsForm);
