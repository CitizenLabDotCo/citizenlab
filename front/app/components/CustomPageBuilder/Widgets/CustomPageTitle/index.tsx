import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useLocalize from 'hooks/useLocalize';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
// Shared with the project page's header widgets; PR 4 moves it somewhere neutral.
import LockedNote from 'components/ProjectPageBuilder/Widgets/LockedNote';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import useWidgetCustomPageId from '../useWidgetCustomPageId';

import messages from './messages';

type Props = {
  // Set only while the builder is open; the saved value lives on the page record.
  title?: Multiloc;
};

const CustomPageTitle = ({ title: draftTitle }: Props) => {
  const pageId = useWidgetCustomPageId();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const padding = useCraftComponentDefaultPadding();
  const { data: page } = useCustomPageById(pageId);

  if (!page) return null;

  const title = localize(draftTitle ?? page.data.attributes.title_multiloc);

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
  } = useNode((node) => ({
    draftTitle: node.data.props.title as Multiloc | undefined,
  }));

  if (!page) return null;

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="16px">
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
