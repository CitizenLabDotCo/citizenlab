import React from 'react';

import { fireEvent, render, screen, userEvent } from 'utils/testUtils/rtl';

import LogicIcon from './LogicIcon';

const logicConfig = (toggleLogicIds = jest.fn()) => ({
  toggleLogicIds,
  filterLogicIds: [],
  isLoading: false,
});

describe('LogicIcon', () => {
  it('toggles the logic filter of the answer when clicked', () => {
    const toggleLogicIds = jest.fn();
    render(
      <LogicIcon
        logicConfig={logicConfig(toggleLogicIds)}
        logicFilterId="rule-1"
        fieldLogic={{ nextPageNumber: 3, numQuestionsSkipped: 2 }}
        type="option"
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(toggleLogicIds).toHaveBeenCalledWith('rule-1');
  });

  it('shows the skipped page and question count on hover', async () => {
    render(
      <LogicIcon
        logicConfig={logicConfig()}
        logicFilterId="rule-1"
        fieldLogic={{ nextPageNumber: 3, numQuestionsSkipped: 2 }}
        type="option"
      />
    );

    await userEvent.hover(screen.getByRole('button'));

    expect(
      await screen.findByText(/skips all pages until page 3 \(2 questions/)
    ).toBeInTheDocument();
  });

  it('treats page number 999 as the survey end (currently existing bug, N6)', async () => {
    render(
      <LogicIcon
        logicConfig={logicConfig()}
        logicFilterId="rule-1"
        fieldLogic={{ nextPageNumber: 999 }}
        type="page"
      />
    );

    await userEvent.hover(screen.getByRole('button'));

    expect(
      await screen.findByText(/skips to the survey end \(0 questions/)
    ).toBeInTheDocument();
  });

  it.each([
    ['there is no logic filter id', null, { nextPageNumber: 3 }],
    ['the answer has no next page', 'rule-1', {}],
    ['the answer has no logic', 'rule-1', undefined],
  ])('renders nothing when %s', (_, logicFilterId, fieldLogic) => {
    render(
      <LogicIcon
        logicConfig={logicConfig()}
        logicFilterId={logicFilterId}
        fieldLogic={fieldLogic}
        type="option"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders nothing without a logic config', () => {
    render(
      <LogicIcon
        logicFilterId="rule-1"
        fieldLogic={{ nextPageNumber: 3 }}
        type="option"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
