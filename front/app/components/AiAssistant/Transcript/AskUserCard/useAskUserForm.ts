import { useState } from 'react';

import { AskUserQuestion } from 'api/ai_assistant_tool_calls/tools/askUser';

// What the user has entered for one question so far.
type Entry = { picks: string[]; written: string };

const EMPTY_ENTRY: Entry = { picks: [], written: '' };

const toAnswer = ({ picks, written }: Entry) => {
  const ownAnswer = written.trim();
  return [...picks, ...(ownAnswer ? [ownAnswer] : [])].join(', ');
};

const useAskUserForm = (questions: AskUserQuestion[]) => {
  const [entries, setEntries] = useState<Partial<Record<string, Entry>>>({});

  const entryFor = (question: string) => entries[question] ?? EMPTY_ENTRY;

  const updateEntry = (question: string, changes: Partial<Entry>) =>
    setEntries({
      ...entries,
      [question]: { ...entryFor(question), ...changes },
    });

  const togglePick = (question: string, option: string) => {
    const { picks } = entryFor(question);
    if (picks.includes(option)) {
      updateEntry(question, { picks: picks.filter((pick) => pick !== option) });
      return;
    }

    const multiSelect = questions.find(
      (other) => other.question === question
    )?.multi_select;
    updateEntry(question, {
      picks: multiSelect ? [...picks, option] : [option],
    });
  };

  const setWritten = (question: string, written: string) =>
    updateEntry(question, { written });

  const answers = questions
    .map(({ question }) => ({ question, answer: toAnswer(entryFor(question)) }))
    .filter(({ answer }) => answer !== '');

  return { entryFor, togglePick, setWritten, answers };
};

export default useAskUserForm;
