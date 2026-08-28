import React from 'react';

import { Box, Title, Toggle } from '@citizenlab/cl2-component-library';
import { useEditor, useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
// Shared with the project page's header widgets; PR 4 moves it somewhere neutral.
import LockedNote from 'components/ProjectPageBuilder/Widgets/LockedNote';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import useWidgetCustomPageId from '../useWidgetCustomPageId';

import messages from './messages';

type Props = {
  // Set only while the builder is open; the saved value lives on the page record.
  title?: Multiloc;
  // A page always has a title_multiloc, but only shows it when it has no banner.
  showTitle?: boolean;
};

const CustomPageTitle = ({ title: draftTitle, showTitle = true }: Props) => {
  const pageId = useWidgetCustomPageId();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const padding = useCraftComponentDefaultPadding();
  const { enabled: inBuilder } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const { data: page } = useCustomPageById(pageId);

  if (!page) return null;

  const title = localize(draftTitle ?? page.data.attributes.title_multiloc);

  // Hidden is a display choice, not an absent widget: the page keeps its name, and the
  // builder has to say so or the toggle looks like it deleted something.
  if (!showTitle) {
    return inBuilder ? (
      <Box maxWidth="1200px" margin="0 auto" px={padding}>
        <WidgetPlaceholder iconName="text">
          <FormattedMessage
            {...messages.hiddenNote}
            values={{ title: title || formatMessage(messages.untitledPage) }}
          />
        </WidgetPlaceholder>
      </Box>
    ) : null;
  }

  return (
    <Box maxWidth="1200px" margin="0 auto" px={padding}>
      <Title color="tenantText" variant="h1" m="0px">
        {title || formatMessage(messages.untitledPage)}
      </Title>
    </Box>
  );
};

const CustomPageTitleSettings = () => {
  const pageId = useWidgetCustomPageId();
  const { formatMessage } = useIntl();
  const { data: page } = useCustomPageById(pageId);
  const {
    actions: { setProp },
    draftTitle,
    showTitle,
  } = useNode((node) => ({
    draftTitle: node.data.props.title as Multiloc | undefined,
    showTitle: (node.data.props.showTitle ?? true) as boolean,
  }));

  if (!page) return null;

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="16px">
      <Toggle
        checked={showTitle}
        label={formatMessage(messages.showTitleLabel)}
        onChange={() => {
          setProp((props: Props) => {
            props.showTitle = !showTitle;
          });
        }}
      />
      <InputMultilocWithLocaleSwitcher
        type="text"
        label={formatMessage(messages.titleLabel)}
        valueMultiloc={draftTitle ?? page.data.attributes.title_multiloc}
        onChange={(value) => {
          setProp((props: Props) => {
            props.title = value;
          });
        }}
      />
      {/* title_multiloc is the page name and the nav bar item's fallback title, not just a
          heading, so an admin renaming a heading needs to know what else moves. */}
      <Warning>{formatMessage(messages.alsoRenamesPageNote)}</Warning>
      <LockedNote message={messages.pinnedNote} />
    </Box>
  );
};

CustomPageTitle.craft = {
  props: {},
  related: {
    settings: CustomPageTitleSettings,
  },
  // Pinned above the body, but deletable: a custom page shows either a banner or a title,
  // and an admin can swap one for the other.
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.title,
    noPointerEvents: true,
  },
};

export default CustomPageTitle;
