import React from 'react';

import PollAdminForm from './PollAdminForm';

import { pollQuestionsData } from 'api/poll_questions/__mocks__/usePollQuestions';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import dragAndDrop from 'utils/testUtils/dragAndDrop';

describe('<PollAdminForm/>', () => {
  it('Shows the right number of question rows', () => {
    render(
      <PollAdminForm phaseId="phaseId" pollQuestions={pollQuestionsData} />
    );

    const questionRows = screen.getAllByTestId('question-row');
    expect(questionRows.length).toEqual(2);
  });

  describe('Add a question button', () => {
    it("Shows when we don't have questions (rows) (yet)", () => {
      render(<PollAdminForm phaseId="phaseId" pollQuestions={null} />);

      const addQuestionButton = screen.getByRole('button', {
        name: /add a poll question/i,
      });
      expect(addQuestionButton).toBeInTheDocument();
    });

    it('Shows when we do have questions (rows)', () => {
      render(
        <PollAdminForm phaseId="phaseId" pollQuestions={pollQuestionsData} />
      );

      const addQuestionButton = screen.getByRole('button', {
        name: /add a poll question/i,
      });
      expect(addQuestionButton).toBeInTheDocument();
    });

    it("Does not show when we are editing a question's answer options", async () => {
      const user = userEvent.setup();
      render(
        <PollAdminForm phaseId="phaseId" pollQuestions={pollQuestionsData} />
      );

      const firstRowEditAnswerOptionsButton = screen.getAllByRole('button', {
        name: /edit answer options/i,
      })[0];
      await user.click(firstRowEditAnswerOptionsButton);
      const addQuestionButton = screen.queryByRole('button', {
        name: /add a poll question/i,
      });
      expect(addQuestionButton).not.toBeInTheDocument();
    });

    it('Does not show after we clicked it', async () => {
      const user = userEvent.setup();
      render(
        <PollAdminForm phaseId="phaseId" pollQuestions={pollQuestionsData} />
      );

      const addQuestionButton = screen.getByRole('button', {
        name: /add a poll question/i,
      });
      await user.click(addQuestionButton);
      expect(addQuestionButton).not.toBeInTheDocument();
    });

    it('opens the new question form', async () => {
      const user = userEvent.setup();
      render(
        <PollAdminForm phaseId="phaseId" pollQuestions={pollQuestionsData} />
      );

      const addQuestionButton = screen.getByRole('button', {
        name: /add a poll question/i,
      });
      await user.click(addQuestionButton);

      const questionFormRow = screen.getByTestId('question-form-row');

      expect(addQuestionButton).not.toBeInTheDocument();
      expect(questionFormRow).toBeInTheDocument();
    });
  });

  it('drags and drops rows (questions) correctly', () => {
    render(
      <PollAdminForm phaseId="phaseId" pollQuestions={pollQuestionsData} />
    );

    const questionRows = screen.getAllByTestId('question-row');
    const firstQuestionRow = questionRows[0];
    const secondQuestionRow = questionRows[1];

    dragAndDrop(firstQuestionRow, secondQuestionRow);

    // Fetch rows again
    const reorderQuestionRows = screen.getAllByTestId('question-row');

    expect(reorderQuestionRows[0]).toEqual(secondQuestionRow);
  });
});
