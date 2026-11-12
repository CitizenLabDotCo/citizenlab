import { useState } from 'react';

import { AskUserQuestion } from 'api/ai_assistant_tool_calls/tools/askUser';

// What the user has entered for one question so far.
type Entry = { picks: string[]; written: string };

const EMPTY_ENTRY: Entry = { picks: [], written: '' };

const toAnswer = ({ picks, written }: Entry) => {
  const ownAnswer = written.trim();
  return [...picks, ...(ownAnswer ? [ownAnswer] : [])].join(', ');
};

// The questions are answered one at a time.
const useAskUserForm = (questions: AskUserQuestion[]) => {
  const [entries, setEntries] = useState<Partial<Record<string, Entry>>>({});
  const [index, setIndex] = useState(0);

  const entryFor = (question: string) => entries[question] ?? EMPTY_ENTRY;

  const current = questions[index];
  const entry = entryFor(current.question);
  const isLastQuestion = index === questions.length - 1;

  const updateEntry = (changes: Partial<Entry>) =>
    setEntries({ ...entries, [current.question]: { ...entry, ...changes } });

  const goBack = () => setIndex(index - 1);
  const goNext = () => setIndex(index + 1);

  const togglePick = (option: string) => {
    if (entry.picks.includes(option)) {
      updateEntry({ picks: entry.picks.filter((pick) => pick !== option) });
      return;
    }

    if (current.multi_select) {
      updateEntry({ picks: [...entry.picks, option] });
      return;
    }

    updateEntry({ picks: [option] });
    // A single choice answers the question, unless the user is also writing their own answer.
    if (!isLastQuestion && entry.written.trim() === '') goNext();
  };

  const setWritten = (written: string) => updateEntry({ written });

  const answers = questions
    .map(({ question }) => ({ question, answer: toAnswer(entryFor(question)) }))
    .filter(({ answer }) => answer !== '');

  return {
    current,
    entry,
    index,
    isLastQuestion,
    goBack,
    goNext,
    togglePick,
    setWritten,
    answers,
  };
};

export default useAskUserForm;
