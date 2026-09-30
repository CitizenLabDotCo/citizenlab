import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';
import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useLocale from 'hooks/useLocale';

import { CUSTOM_PAGE_BUILDER_PATH } from 'components/admin/ContentBuilder/constants';
import PagePreview from 'components/admin/PagePreview';
import useEnsureCustomPageLayout from 'components/CustomPageBuilder/useEnsureCustomPageLayout';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../../messages';
import EditCustomPageSettings from '../Settings';

const SettingsWithPreview = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { customPageId } = useParams({
    from: '/$locale/admin/pages-menu/pages/$customPageId',
  });
  const { data: customPage, dataUpdatedAt } = useCustomPageById(customPageId);
  const { data: layout } = useCustomPageLayout(customPageId);
  useEnsureCustomPageLayout(customPageId);

  if (!customPage) return null;

  const openContentBuilder = () => {
    clHistory.push(`${CUSTOM_PAGE_BUILDER_PATH}/pages/${customPageId}`);
  };

  return (
    <Box display="flex" gap="24px" alignItems="flex-start">
      <Box flex="1" minWidth="0">
        <EditCustomPageSettings />
      </Box>
      <Box flex="1" minWidth="0">
        {/* Without a layout the page renders its legacy sections, so the preview waits for one. */}
        {layout && (
          // The frame runs its own copy of the app, so it is remounted to show a save.
          <PagePreview
            key={dataUpdatedAt}
            src={`/${locale}/pages/${customPage.data.attributes.slug}`}
            iframeTitle={formatMessage(messages.customPagePreviewTitle)}
            editPageContentAriaLabel={formatMessage(
              messages.editCustomPageInContentBuilder
            )}
            onEdit={openContentBuilder}
            dataCy="e2e-custom-page-preview"
            alignTop
          />
        )}
      </Box>
    </Box>
  );
};

export default SettingsWithPreview;
