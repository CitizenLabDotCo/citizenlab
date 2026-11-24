import React, { useEffect, useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { loadUserjotSdk, UserjotIdentity } from './userjotSdk';

interface Props {
  projectId: string;
  identity: UserjotIdentity;
}

const UserjotEmbed = ({ projectId, identity }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = true;
    const onError = () => {
      if (active) setFailed(true);
    };

    loadUserjotSdk().init(projectId, {
      onReady: () => {
        // The SDK script replaces window.uj once loaded, so don't reuse the queueing stub here.
        if (!active || !window.uj) return;
        window.uj.identify(identity);
        window.uj.embed({ container, path: '/', theme: 'light', onError });
      },
      onError,
    });

    return () => {
      active = false;
      window.uj?.destroy();
    };
  }, [projectId, identity]);

  if (failed) {
    return (
      <Warning>
        <FormattedMessage {...messages.loadingFailed} />
      </Warning>
    );
  }

  return (
    <Box ref={containerRef} id="e2e-userjot-embed" w="100%" minHeight="720px" />
  );
};

export default UserjotEmbed;
