// One generation request made from the panel, and its outcome once the job is done.
export type Exchange = {
  id: string;
  prompt: string;
  fileNames: string[];
  // The newest job before this request was sent, to recognise the job it started.
  previousJobId: string | undefined;
  outcome?: 'succeeded' | 'failed';
};
