import React, { useEffect, useRef } from 'react';

import generalMessages from 'containers/Admin/projects/project/general/messages';

import Banner from 'design-system/Banner';

import { useIntl } from 'utils/cl-intl';

import { useSetupDraft } from './SetupDraftContext';

const SaveError = () => {
  const { formatMessage } = useIntl();
  const { saveFailed } = useSetupDraft();
  const ref = useRef<HTMLDivElement>(null);

  // The panel may be scrolled to the card that triggered the save.
  useEffect(() => {
    if (saveFailed) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [saveFailed]);

  if (!saveFailed) return null;

  return (
    <div ref={ref}>
      <Banner tone="error">
        {formatMessage(generalMessages.saveErrorMessage)}
      </Banner>
    </div>
  );
};

export default SaveError;
