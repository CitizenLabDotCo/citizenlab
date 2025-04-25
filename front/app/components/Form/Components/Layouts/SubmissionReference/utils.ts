interface GetMailLinkParams {
  email?: string;
  subject: string;
  body: string;
}

export const getMailLink = ({ email, subject, body }: GetMailLinkParams) => {
  const mailto = `mailto:${email ?? ''}`;
  const subjectParam = `?subject=${subject}`;
  const bodyParam = `&body=${body}`;

  return mailto + subjectParam + bodyParam;
};
