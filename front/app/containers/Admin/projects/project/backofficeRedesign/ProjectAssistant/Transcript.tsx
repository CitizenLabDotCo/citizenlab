import React, { useEffect, useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ResultMessage from './ResultMessage';
import { Exchange } from './types';
import UserMessage from './UserMessage';
import WorkingIndicator from './WorkingIndicator';

type Props = {
  exchanges: Exchange[];
  runningJobStartedAt: string | undefined;
};

const Transcript = ({ exchanges, runningJobStartedAt }: Props) => {
  const endRef = useRef<HTMLDivElement>(null);
  const lastOutcome = exchanges.at(-1)?.outcome;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [exchanges.length, lastOutcome, runningJobStartedAt]);

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      {exchanges.map((exchange) => (
        <React.Fragment key={exchange.id}>
          <UserMessage prompt={exchange.prompt} fileNames={exchange.fileNames} />
          {exchange.outcome && (
            <ResultMessage succeeded={exchange.outcome === 'succeeded'} />
          )}
        </React.Fragment>
      ))}
      {runningJobStartedAt && <WorkingIndicator startedAt={runningJobStartedAt} />}
      <div ref={endRef} />
    </Box>
  );
};

export default Transcript;
