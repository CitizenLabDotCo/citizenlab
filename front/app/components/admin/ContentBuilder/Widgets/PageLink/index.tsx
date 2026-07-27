import React, { useMemo } from 'react';

import {
  Box,
  colors,
  fontSizes,
  Icon,
  IconButton,
  Label,
  Radio,
  Select,
  Spinner,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode, useEditor } from '@craftjs/core';
import styled from 'styled-components';

import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useParams } from 'utils/router';
import { stripHtml } from 'utils/textUtils';

import messages from './messages';
import PagePlaceholder from './PagePlaceholder';

type DisplayType = 'link' | 'preview';

type PageLinkProps = {
  pageId?: string;
  displayType?: DisplayType;
};

// Characters of the (HTML-stripped) top info section shown in preview mode.
const PREVIEW_MAX_LENGTH = 300;

const PageLinkRow = typedStyled(Link)`
  display: flex;
  align-items: center;
  color: ${colors.textSecondary};
  border: 1px solid ${colors.borderLight};
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

const PreviewTitleLink = typedStyled(Link)`
  display: inline-block;
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.l}px;
  font-weight: 600;
  line-height: 1.3;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.tenantText};
    text-decoration: underline;
  }
`;

const PageLink = ({ pageId, displayType = 'link' }: PageLinkProps) => {
  const localize = useLocalize();
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const { data: page, isLoading } = useCustomPageById(pageId);
  const projectId = page?.data.attributes.project_id;
  const { data: project } = useProjectById(projectId);

  // Resolved page -> render it. Pointer events off in the builder so a click
  // selects the widget instead of navigating; clickable once published.
  if (page && project) {
    const linkParams = {
      to: '/projects/$slug/pages/$pageSlug',
      params: {
        slug: project.data.attributes.slug,
        pageSlug: page.data.attributes.slug,
      },
    } as const;
    const title = localize(page.data.attributes.title_multiloc);

    if (displayType === 'preview') {
      const previewText = stripHtml(
        localize(page.data.attributes.top_info_section_multiloc),
        PREVIEW_MAX_LENGTH
      );

      return (
        <Box
          id="e2e-page-link"
          maxWidth="1200px"
          pointerEvents={enabled ? 'none' : 'auto'}
        >
          <PreviewTitleLink {...linkParams}>{title}</PreviewTitleLink>
          {previewText && (
            <Text mt="8px" mb="0px" color="textSecondary">
              {previewText}
            </Text>
          )}
        </Box>
      );
    }

    return (
      <Box
        id="e2e-page-link"
        maxWidth="1200px"
        pointerEvents={enabled ? 'none' : 'auto'}
      >
        <PageLinkRow {...linkParams}>
          <RowIcon name="file" width="20px" height="20px" />
          {title}
        </PageLinkRow>
      </Box>
    );
  }

  // Unresolved in view mode -> hide entirely.
  if (!enabled) return null;

  if (isLoading) return null;

  // Builder: prompt to pick a page, or flag a missing one.
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
    displayType = 'link',
  } = useNode((node) => ({
    pageId: node.data.props.pageId,
    displayType: node.data.props.displayType,
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

  // Full-panel spinner on initial load only; refetches keep the panel visible.
  if (!pages) {
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
      <Box>
        <Label>{formatMessage(messages.displayTypeLabel)}</Label>
        <Radio
          onChange={(value: DisplayType) => {
            setProp((props: PageLinkProps) => {
              props.displayType = value;
            });
          }}
          currentValue={displayType}
          id="page-link-display-link"
          name="page-link-display-type"
          value="link"
          label={formatMessage(messages.displayTypeLink)}
        />
        <Radio
          onChange={(value: DisplayType) => {
            setProp((props: PageLinkProps) => {
              props.displayType = value;
            });
          }}
          currentValue={displayType}
          id="page-link-display-preview"
          name="page-link-display-type"
          value="preview"
          label={formatMessage(messages.displayTypePreview)}
        />
      </Box>

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
