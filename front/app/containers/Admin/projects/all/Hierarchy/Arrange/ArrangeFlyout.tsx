import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import MenuRow from '../Menu/MenuRow';
import useFocusFirst from '../Menu/useFocusFirst';
import messages from '../messages';

import { ArrangeMove } from './arrangeTargets';

const moveMessages = {
  start: messages.moveToStart,
  earlier: messages.moveEarlier,
  later: messages.moveLater,
  end: messages.moveToEnd,
};

interface Props {
  moves: ArrangeMove[];
  takeFocus: boolean;
  onPick: (move: ArrangeMove) => void;
}

const ArrangeFlyout = ({ moves, takeFocus, onPick }: Props) => {
  const { formatMessage } = useIntl();
  const focusFirst = useFocusFirst(takeFocus);

  return (
    <Box
      ref={focusFirst}
      role="menu"
      aria-label={formatMessage(messages.arrange)}
    >
      {moves.map((move) => (
        <MenuRow
          key={move}
          label={formatMessage(moveMessages[move])}
          onClick={() => onPick(move)}
        />
      ))}
    </Box>
  );
};

export default ArrangeFlyout;
