export type AskUserQuestion = {
  question: string;
  options: string[];
  multi_select?: boolean;
};

export type AskUserArguments = { questions: AskUserQuestion[] };
