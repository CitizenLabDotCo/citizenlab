export interface SubmitPollParams {
  submitPollResponse: () => void;
}

export const submitPoll =
  ({ submitPollResponse }: SubmitPollParams) =>
  async () => {
    submitPollResponse();
  };
