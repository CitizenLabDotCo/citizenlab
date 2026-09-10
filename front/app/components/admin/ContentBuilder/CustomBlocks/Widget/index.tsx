import React from 'react';

import { Box, Spinner, Text, colors } from '@citizenlab/cl2-component-library';

import { BlockConfigValues } from 'api/custom_blocks/types';
import useCustomBlock from 'api/custom_blocks/useCustomBlock';

import useLocale from 'hooks/useLocale';

import { FormattedMessage } from 'utils/cl-intl';
import { useLocation } from 'utils/router';

import messages from '../messages';
import CustomBlockRenderer, {
  buildMessageLookup,
} from '../runtime/CustomBlockRenderer';
import useBlockModule from '../runtime/useBlockModule';
import useResetKey from '../runtime/useResetKey';

import Settings from './Settings';

interface Props {
  blockId?: string;
  version?: number;
  config?: BlockConfigValues;
}

const useIsInBuilder = () => {
  const { pathname } = useLocation();
  return pathname.includes('admin/reporting/report-builder');
};

const BuilderNotice = ({
  message,
}: {
  message: typeof messages.blockLoadError;
}) => (
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
  const attributes = block?.data.attributes;
  const { component: BlockComponent, failed: loadFailed } = useBlockModule({
    blockId,
    version,
    pending: attributes?.current_version?.compile_state === 'pending',
  });

  // The error boundary retries when the module or the sidebar config changes.
  const boundaryResetKey = useResetKey([BlockComponent, config]);

  if (!blockId || !version) return null;

  if (attributes && attributes.status === 'disabled') {
    return inBuilder ? (
      <BuilderNotice message={messages.blockDisabled} />
    ) : null;
  }

  if (loadFailed) {
    return inBuilder ? (
      <BuilderNotice message={messages.blockLoadError} />
    ) : null;
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
  const msg = buildMessageLookup(attributes?.current_version?.messages, locale);

  return (
    <Box maxWidth="1200px" margin="0 auto" className="e2e-custom-block">
      <CustomBlockRenderer
        component={BlockComponent}
        config={config}
        resetKey={boundaryResetKey}
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
