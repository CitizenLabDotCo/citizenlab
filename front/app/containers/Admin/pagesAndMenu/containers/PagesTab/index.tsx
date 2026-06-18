import React from 'react';

import {
  Box,
  colors,
  Divider,
  IconButton,
  stylingConsts,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { ICustomPageData, TCustomPageCode } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useDeleteCustomPage from 'api/custom_pages/useDeleteCustomPage';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PagesMenuTabs from 'containers/Admin/pagesAndMenu/components/PagesMenuTabs';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import customPageMessages from 'containers/Admin/pagesAndMenu/containers/CustomPages/messages';
import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

import messages from './messages';

// Policy pages (terms, privacy, cookie) are managed in Settings, not here.
const FIXED_PAGES_SET = new Set<TCustomPageCode>([
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
]);
const isNotFixedPage = (page: ICustomPageData) =>
  !FIXED_PAGES_SET.has(page.attributes.code);

const PagesTab = () => {
  const { formatMessage } = useIntl();
  const { data: pages } = useCustomPages();
  const { mutate: deleteCustomPage } = useDeleteCustomPage();

  const canCreateCustomPages = useFeatureFlag({
    name: 'pages',
    onlyCheckAllowed: true,
  });

  if (!pages) {
    return null;
  }

  const customPages = pages.data.filter(isNotFixedPage);

  const handleClickDelete = (pageId: string) => () => {
    if (window.confirm(formatMessage(messages.deletePageConfirmation))) {
      deleteCustomPage(pageId);
    }
  };

  return (
    <PagesMenuTabs activeTab="pages">
      <SectionFormWrapper
        title={formatMessage(messages.pagesTitle)}
        subtitle={formatMessage(messages.pagesSubtitle)}
        rightSideCTA={
          <Tooltip
            content={formatMessage(
              customPageMessages.contactGovSuccessToAccessPages
            )}
            disabled={canCreateCustomPages}
          >
            <Box>
              <ButtonWithLink
                buttonStyle="admin-dark"
                icon="plus-circle"
                id="create-custom-page"
                to={`${ADMIN_PAGES_MENU_PATH}/pages/new`}
                className="intercom-admin-pages-menu-add-page"
                disabled={!canCreateCustomPages}
              >
                {formatMessage(messages.newCustomPage)}
              </ButtonWithLink>
            </Box>
          </Tooltip>
        }
      >
        {customPages.length === 0 ? (
          <Text color="textSecondary" py="16px">
            {formatMessage(messages.noPages)}
          </Text>
        ) : (
          <Box>
            {customPages.map((page, i) => (
              <>
                <Box
                  key={page.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text>
                    <T value={page.attributes.title_multiloc} />
                  </Text>
                  <Box display="flex" gap="12px" alignItems="center">
                    <IconButton
                      iconName="edit"
                      onClick={() =>
                        clHistory.push(
                          `${ADMIN_PAGES_MENU_PATH}/pages/${page.id}/settings`
                        )
                      }
                      a11y_buttonActionMessage={formatMessage(
                        messages.editPage
                      )}
                      iconColor={colors.textSecondary}
                      iconColorOnHover={colors.primary}
                      p="4px"
                      border={`1px solid ${colors.borderLight}`}
                      borderRadius={stylingConsts.borderRadius}
                    />
                    <Link to={`/pages/${page.attributes.slug}`} target="_blank">
                      <IconButton
                        iconName="eye"
                        onClick={() => {}}
                        a11y_buttonActionMessage={formatMessage(
                          messages.viewPage
                        )}
                        iconColor={colors.textSecondary}
                        iconColorOnHover={colors.primary}
                        p="4px"
                        border={`1px solid ${colors.borderLight}`}
                        borderRadius={stylingConsts.borderRadius}
                      />
                    </Link>
                    <IconButton
                      iconName="delete"
                      onClick={handleClickDelete(page.id)}
                      a11y_buttonActionMessage={formatMessage(
                        messages.deletePage
                      )}
                      iconColor={colors.textSecondary}
                      iconColorOnHover={colors.red600}
                      p="4px"
                      border={`1px solid ${colors.borderLight}`}
                      borderRadius={stylingConsts.borderRadius}
                    />
                  </Box>
                </Box>
                <Divider />
              </>
            ))}
          </Box>
        )}
      </SectionFormWrapper>
    </PagesMenuTabs>
  );
};

export default PagesTab;
