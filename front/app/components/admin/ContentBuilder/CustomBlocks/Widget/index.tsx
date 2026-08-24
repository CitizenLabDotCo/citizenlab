import React, { ComponentType, useEffect, useState } from 'react';

import { Box, Spinner, Text, colors } from '@citizenlab/cl2-component-library';

import { BlockConfigValues, customBlockBundleUrl } from 'api/custom_blocks/types';
import useCustomBlock from 'api/custom_blocks/useCustomBlock';

import useLocale from 'hooks/useLocale';

import { FormattedMessage } from 'utils/cl-intl';
import { useLocation } from 'utils/router';

import messages from '../messages';
import CustomBlockRenderer, {
  buildMessageLookup,
} from '../runtime/CustomBlockRenderer';
import { loadBlockModule } from '../runtime/loadBlockModule';
import { BlockProps } from '../runtime/types';

import Settings from './Settings';

interface Props {
  blockId?: string;
  version?: number;
  config?: BlockConfigValues;
}

const useIsInBuilder = () => {
  const { pathname } = useLocation();
  return (
    pathname.includes('admin/pages-menu') ||
    pathname.includes('admin/project-page-builder')
  );
};

const BuilderNotice = ({ message }: { message: typeof messages.blockLoadError }) => (
  <Box
    p="16px"
    background={colors.errorLight}
    borderRadius="3px"
    data-testid="custom-block-notice"
  >
    <Text m="0" color="error">
      <FormattedMessage {...message} />
    </Text>
  </Box>
);

const CustomBlock = ({ blockId, version, config = {} }: Props) => {
  const inBuilder = useIsInBuilder();
  const locale = useLocale();
  const { data: block } = useCustomBlock(blockId);
  const [BlockComponent, setBlockComponent] =
    useState<ComponentType<BlockProps> | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!blockId || !version) return;

    let live = true;
    setLoadFailed(false);
    loadBlockModule(customBlockBundleUrl(blockId, version))
      .then((mod) => {
        if (live) setBlockComponent(() => mod.default);
      })
      .catch(() => {
        if (live) setLoadFailed(true);
      });

    return () => {
      live = false;
    };
  }, [blockId, version]);

  if (!blockId || !version) return null;

  const attributes = block?.data.attributes;
  if (attributes && attributes.status === 'disabled') {
    return inBuilder ? <BuilderNotice message={messages.blockDisabled} /> : null;
  }

  if (loadFailed) {
    return inBuilder ? <BuilderNotice message={messages.blockLoadError} /> : null;
  }

  if (!BlockComponent) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        p="24px"
        minHeight="60px"
        className="e2e-custom-block-loading"
      >
        <Spinner />
      </Box>
    );
  }

  // NOTE: messages come from the block's current version, while the bundle is
  // pinned to the version stored in the layout. Acceptable drift while the
  // feature is hidden; revisit when versions diverge in practice.
  const msg = buildMessageLookup(
    attributes?.current_version?.messages,
    locale
  );

  return (
    <Box maxWidth="1200px" margin="0 auto" className="e2e-custom-block">
      <CustomBlockRenderer
        component={BlockComponent}
        config={config}
        msg={msg}
        fallback={
          inBuilder ? <BuilderNotice message={messages.blockLoadError} /> : null
        }
      />
    </Box>
  );
};

CustomBlock.craft = {
  props: {
    blockId: '',
    version: 0,
    config: {},
  },
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.customBlockTitle,
  },
};

export const customBlockTitle = messages.customBlockTitle;

export default CustomBlock;
