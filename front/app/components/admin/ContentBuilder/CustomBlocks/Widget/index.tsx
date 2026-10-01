import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { BlockConfigValues } from 'api/custom_blocks/types';
import useCustomBlockVersion from 'api/custom_blocks/useCustomBlockVersion';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { useLocation } from 'utils/router';

import messages from '../messages';
import BlockErrorBoundary from '../runtime/BlockErrorBoundary';
import { getDraftBlock, isDraft } from '../runtime/draftBlock';
import useBlockMessages from '../runtime/useBlockMessages';
import useLoadedBlock from '../runtime/useLoadedBlock';

import BuilderNotice from './BuilderNotice';
import Settings from './Settings';

interface Props {
  blockId?: string;
  version?: number;
  config?: BlockConfigValues;
}

// Where a broken block must say so rather than leave a gap: the builder an admin is
// working in, and the harness the check service renders in. On a report a resident
// reads, a block that failed renders nothing at all.
const useShowsFailures = () => {
  const { pathname } = useLocation();

  return (
    pathname.includes('admin/reporting/report-builder') ||
    pathname.includes('block-harness')
  );
};

/**
 * Hosts one generated block on a page.
 *
 * The node pins `{ blockId, version, config }`, and everything rendered here
 * follows that pin: the bundle, the message catalogues and the settings all come
 * from that one version. The resolver has a single entry for every generated
 * block, so a new block never needs a rebuild or an editor remount.
 */
const CustomBlock = ({ blockId, version, config = {} }: Props) => {
  const showsFailures = useShowsFailures();
  // A draft is the block being checked before it has a version to fetch. Only the
  // check service's harness ever places one.
  const draft = isDraft(blockId) ? getDraftBlock() : null;
  const { data: blockVersion } = useCustomBlockVersion({
    blockId: draft ? undefined : blockId,
    version,
  });
  const attributes = blockVersion?.data.attributes;
  const disabled = attributes?.block_status === 'disabled';

  const { component: Component, failed } = useLoadedBlock({
    blockId: disabled ? undefined : blockId,
    version: disabled ? undefined : version,
  });
  const msg = useBlockMessages(draft?.messages ?? attributes?.messages);

  if (!blockId || (!version && !draft)) return null;

  if (disabled) {
    return showsFailures ? (
      <BuilderNotice message={messages.blockDisabled} />
    ) : null;
  }

  if (failed) {
    return showsFailures ? (
      <BuilderNotice message={messages.blockLoadError} />
    ) : null;
  }

  if (!Component) {
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

  return (
    // PageBreakBox, not Box: a report is read as a PDF, and a chart split across
    // a page break is unreadable. The text widget wraps itself the same way.
    <PageBreakBox
      maxWidth="1200px"
      margin="0 auto"
      className="e2e-custom-block"
    >
      <BlockErrorBoundary
        // Remounting is how the boundary retries: a new version, or a setting
        // the admin corrected, gets one fresh attempt.
        key={`${blockId}:${version}:${JSON.stringify(config)}`}
        blockId={blockId}
        version={version}
        fallback={
          showsFailures ? (
            <BuilderNotice message={messages.blockLoadError} />
          ) : null
        }
      >
        <Component config={config} msg={msg} />
      </BlockErrorBoundary>
    </PageBreakBox>
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
