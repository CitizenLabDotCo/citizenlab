import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';
import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useLocale from 'hooks/useLocale';

import PagePreview from 'components/admin/PagePreview';
import useEnsureCustomPageLayout from 'components/CustomPageBuilder/useEnsureCustomPageLayout';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import messages from '../../messages';
import EditCustomPageSettings from '../Settings';

const SettingsWithPreview = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  const { data: customPage } = useCustomPageById(customPageId);
  const { data: layout } = useCustomPageLayout(customPageId);
  useEnsureCustomPageLayout(customPageId);

  if (isNilOrError(customPage)) return null;

  const openContentBuilder = () => {
    clHistory.push(`/admin/custom-page-builder/pages/${customPageId}`);
  };

  return (
    <Box display="flex" gap="24px" alignItems="flex-start">
      <Box flex="1" minWidth="0">
        <EditCustomPageSettings hideLinkedItems />
      </Box>
      <Box flex="1" minWidth="0">
        {/* Without a layout the page renders its legacy sections, so the preview waits for one. */}
        {layout && (
          <PagePreview
            src={`/${locale}/pages/${customPage.data.attributes.slug}`}
            iframeTitle={formatMessage(messages.customPagePreviewTitle)}
            editPageContentAriaLabel={formatMessage(
              messages.editCustomPageInContentBuilder
            )}
            onEdit={openContentBuilder}
          />
        )}
      </Box>
    </Box>
  );
};

export default SettingsWithPreview;
