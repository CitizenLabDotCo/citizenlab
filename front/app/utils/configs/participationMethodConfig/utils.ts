export const getMailLink = (ideaId: string, bodyStr: string) => {
  const mailto = 'mailto:email@example.com';
  const subject = '?subject=Survey identifier';
  const body = `&body=${bodyStr} ${ideaId}`;

  return mailto + subject + body;
};
