import React from 'react';

import { useEditor } from '@craftjs/core';

import { ICustomPageData } from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';

import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
import CustomPageHeader from 'components/CustomPageHeader';

import { FormattedMessage } from 'utils/cl-intl';

import { BannerDraft } from '../../customPageAttributeDrafts';
import useWidgetCustomPageId from '../useWidgetCustomPageId';

import messages from './messages';
import Settings from './Settings';

type Props = {
  // Unsaved settings-panel edits, so the builder previews them before they reach the page.
  draft?: BannerDraft;
};

// Renders from the page's own banner_* columns, as the front office does, so there is no
// second copy of the banner to keep in step. The admin edit button is deliberately not
// passed: CustomPageShow renders one for the whole page.
const CustomPageBanner = ({ draft = {} }: Props) => {
  const pageId = useWidgetCustomPageId();
  const { enabled: inBuilder } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const { data: page } = useCustomPageById(pageId);

  if (!page) return null;

  const pageData: ICustomPageData = {
    ...page.data,
    attributes: {
      ...page.data.attributes,
      ...draft,
      header_bg:
        draft.header_bg === undefined
          ? page.data.attributes.header_bg
          : draft.header_bg
          ? ({
              large: draft.header_bg,
            } as ICustomPageData['attributes']['header_bg'])
          : null,
    },
  };

  const { header_bg, banner_header_multiloc } = pageData.attributes;
  // Empty on a page that never had a banner, where the layouts would render a bare
  // coloured block that reads as broken rather than as unconfigured.
  const isEmpty =
    !header_bg?.large && Object.keys(banner_header_multiloc).length === 0;

  if (isEmpty) {
    return inBuilder ? (
      <WidgetPlaceholder iconName="image">
        <FormattedMessage {...messages.noBannerYet} />
      </WidgetPlaceholder>
    ) : null;
  }

  return <CustomPageHeader pageData={pageData} />;
};

CustomPageBanner.craft = {
  props: {},
  related: {
    settings: Settings,
  },
  // Pinned above the body like the title, but a page may have no banner at all, so this one
  // is deletable and can be dragged back from the toolbox.
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.title,
    noPointerEvents: true,
  },
};

export default CustomPageBanner;
