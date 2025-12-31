import clHistory from 'utils/cl-router/history';

export interface RedirectToProjectParams {
  projectSlug: string;
}

export const redirectToProject = ({ projectSlug }: RedirectToProjectParams) => {
  return () => {
    clHistory.push(`/projects/${projectSlug}`);
  };
};
