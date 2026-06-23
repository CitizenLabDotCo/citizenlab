import React, { ReactNode, useMemo } from 'react';

import {
  Box,
  colors,
  fontSizes,
  Icon,
  IconButton,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode, useEditor } from '@craftjs/core';
import { lighten } from 'polished';
import styled from 'styled-components';

import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

import messages from './messages';

type PageLinkProps = {
  pageId?: string;
};

const PageLinkRow = typedStyled(Link)`
  display: flex;
  align-items: center;
  color: ${colors.textSecondary};
  border: 1px solid ${lighten(0.4, colors.textSecondary)};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: ${fontSizes.base}px;
  line-height: 24px;
  padding: 10px 20px;
  margin-bottom: 10px;
  text-decoration: underline;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const RowIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 15px;
  flex-shrink: 0;
`;

const PlaceholderContainer = styled(Box)<{ color: string }>`
  display: flex;
  align-items: center;
  color: ${({ color }) => color};
  border: 1px solid ${(props) => props.theme.colors.borderLight};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: ${fontSizes.base}px;
  padding: 10px 20px;
  margin-bottom: 10px;
`;

const PagePlaceholder = ({
  variant,
  children,
}: {
  variant?: 'error';
  children: ReactNode;
}) => {
  const color = variant === 'error' ? colors.error : colors.textSecondary;
  return (
    <PlaceholderContainer color={color}>
      <RowIcon name="file" fill={color} width="20px" height="20px" />
      {children}
    </PlaceholderContainer>
  );
};

const PageLink = ({ pageId }: PageLinkProps) => {
  const localize = useLocalize();
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const { data: page, isLoading } = useCustomPageById(pageId);
  const projectId = page?.data.attributes.project_id;
  const { data: project } = useProjectById(projectId);

  // Selected page resolved -> render the public link. Disable pointer events
  // while in the builder (`enabled`) so clicking selects the widget instead of
  // navigating away; the link stays clickable once published.
  if (page && project) {
    return (
      <Box
        id="e2e-page-link"
        maxWidth="1200px"
        pointerEvents={enabled ? 'none' : 'auto'}
      >
        <PageLinkRow
          to="/projects/$slug/pages/$pageSlug"
          params={{
            slug: project.data.attributes.slug,
            pageSlug: page.data.attributes.slug,
          }}
        >
          <RowIcon name="file" width="20px" height="20px" />
          {localize(page.data.attributes.title_multiloc)}
        </PageLinkRow>
      </Box>
    );
  }

  // No resolved page in view mode -> hide the widget entirely.
  if (!enabled) return null;

  if (isLoading) return null;

  // Edit mode placeholder: prompt to pick a page, or flag a missing one.
  return (
    <Box maxWidth="1200px" margin="0 auto">
      <PagePlaceholder variant={pageId ? 'error' : undefined}>
        <FormattedMessage
          {...(pageId ? messages.pageMissing : messages.noPageSelected)}
        />
      </PagePlaceholder>
    </Box>
  );
};

const PageLinkSettings = () => {
  const {
    actions: { setProp },
    pageId,
  } = useNode((node) => ({
    pageId: node.data.props.pageId,
  }));

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { projectId } = useParams({ strict: false });

  const {
    data: pages,
    isFetching: isFetchingPages,
    refetch: refetchPages,
  } = useCustomPages({
    projectId,
  });

  const pageOptions = useMemo(() => {
    if (!pages) return [];

    return pages.data.map((page) => ({
      value: page.id,
      label: localize(page.attributes.title_multiloc),
    }));
  }, [pages, localize]);

  // Only take over the whole panel on the initial load; background refetches
  // (e.g. the refresh button below) keep the panel visible.
  if (isFetchingPages && !pages) {
    return <Spinner />;
  }

  return (
    <Box
      background={colors.white}
      my="32px"
      display="flex"
      flexDirection="column"
      gap="12px"
    >
      {pageOptions.length === 0 ? (
        <Text m="0px">{formatMessage(messages.noPagesAvailable)}</Text>
      ) : (
        <Select
          value={pageId}
          onChange={(option) => {
            setProp((props: PageLinkProps) => {
              props.pageId = option.value;
            });
          }}
          placeholder={formatMessage(messages.selectPage)}
          options={pageOptions}
          label={formatMessage(messages.selectPage)}
        />
      )}

      {projectId && (
        <Box display="flex" alignItems="center" gap="4px">
          <ButtonWithLink
            to="/admin/projects/$projectId/pages/new"
            params={{ projectId }}
            buttonStyle="text"
            icon="plus-circle"
            openLinkInNewTab={true}
          >
            {formatMessage(messages.addNewPage)}
          </ButtonWithLink>
          {/* Refresh the list to pick up pages added in the other tab. */}
          {isFetchingPages ? (
            <Box p="4px" display="flex">
              <Spinner size="20px" />
            </Box>
          ) : (
            <IconButton
              iconName="refresh"
              onClick={() => refetchPages()}
              a11y_buttonActionMessage={formatMessage(messages.refreshPages)}
              iconColor={colors.textSecondary}
              iconColorOnHover={colors.black}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

PageLink.craft = {
  related: {
    settings: PageLinkSettings,
  },
  custom: {
    title: messages.pageLink,
    noPointerEvents: true,
  },
};

export default PageLink;
