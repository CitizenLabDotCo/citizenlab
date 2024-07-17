import React from 'react';

import { Accordion, Title } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../containers/Project/Granular/messages';

interface Props {
  phaseNumber: number;
  phaseTitle: Multiloc;
  children: React.ReactNode;
  onChange: () => void;
}

const PhaseAccordion = ({
  phaseNumber,
  phaseTitle,
  children,
  onChange,
}: Props) => {
  return (
    <Accordion
      timeoutMilliseconds={1000}
      transitionHeightPx={1700}
      isOpenByDefault={false}
      title={
        <Title
          id="e2e-granular-permissions-phase-accordion"
          variant="h3"
          color="primary"
          my="20px"
          style={{ fontWeight: 500 }}
        >
          <>
            <FormattedMessage {...messages.phase} />
            {` ${phaseNumber}: `}
          </>
          <T value={phaseTitle} />
        </Title>
      }
      onChange={onChange}
    >
      {children}
    </Accordion>
  );
};

export default PhaseAccordion;
