import React from 'react';

import PollAdminForm from './PollAdminForm';

import { mockQuestion } from 'services/__mocks__/pollQuestions';
import { render, screen, userEvent } from 'utils/testUtils/rtl';
import dragAndDrop from 'utils/testUtils/dragAndDrop';

const pollQuestions = [
  'How are you today?',
  'What is on the menu for dinner tonight?',
  "What's your favourite ice cream flavor?",
].map((item, index) => mockQuestion(index.toString(), item));

describe('<PollAdminForm/>', () => {
  it('Shows the right number of question rows', () => {
    render(
      <PollAdminForm
        participationContextId="projectId"
        participationContextType="project"
        pollQuestions={pollQuestions}
      />
    );

    const questionRows = screen.getAllByTestId('question-row');
    expect(questionRows.length).toEqual(3);
  });

  describe('Add a question button', () => {
    it("Shows when we don't have questions (rows) (yet)", () => {
      render(
        <PollAdminForm
          participationContextId="projectId"
          participationContextType="project"
          pollQuestions={null}
        />
      );

      const addQuestionButton = screen.getByRole('button', {
        name: /add a poll question/i,
      });
      expect(addQuestionButton).toBeInTheDocument();
    });

    it('Shows when we do have questions (rows)', () => {
      render(
        <PollAdminForm
          participationContextId="projectId"
          participationContextType="project"
          pollQuestions={pollQuestions}
        />
      );

      const addQuestionButton = screen.getByRole('button', {
        name: /add a poll question/i,
      });
      expect(addQuestionButton).toBeInTheDocument();
    });

    it("Does not show when we are editing a question's answer options", async () => {
      const user = userEvent.setup();
      render(
        <PollAdminForm
          participationContextId="projectId"
          participationContextType="project"
          pollQuestions={pollQuestions}
        />
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
        <PollAdminForm
          participationContextId="projectId"
          participationContextType="project"
          pollQuestions={pollQuestions}
        />
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
        <PollAdminForm
          participationContextId="projectId"
          participationContextType="project"
          pollQuestions={pollQuestions}
        />
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

  it('handles question deletion', async () => {
    const user = userEvent.setup();
    render(
      <PollAdminForm
        participationContextId="projectId"
        participationContextType="project"
        pollQuestions={pollQuestions}
      />
    );
    const questionRows = screen.getAllByTestId('question-row');
    const firstRowDeleteButton = screen.getAllByRole('button', {
      name: /delete/i,
    })[0];

    expect(questionRows.length).toEqual(3);

    await user.click(firstRowDeleteButton);

    const refetchedQuestionRows = screen.getAllByTestId('question-row');

    expect(refetchedQuestionRows.length).toEqual(2);
  });

  it('drags and drops rows (questions) correctly', () => {
    render(
      <PollAdminForm
        participationContextId="projectId"
        participationContextType="project"
        pollQuestions={pollQuestions}
      />
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
