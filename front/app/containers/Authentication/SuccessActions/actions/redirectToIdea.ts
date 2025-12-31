import clHistory from 'utils/cl-router/history';

export interface RedirectToIdeaParams {
  ideaSlug: string;
}

export const redirectToIdea = ({ ideaSlug }: RedirectToIdeaParams) => {
  return () => {
    clHistory.push(`/ideas/${ideaSlug}`);
  };
};
