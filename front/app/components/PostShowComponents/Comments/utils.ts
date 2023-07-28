export function getCommentContent(commentBody: string) {
  return commentBody.replace(
    /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi,
    '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
  );
}

export function getEditableCommentContent(commentBody: string) {
  return commentBody.replace(
    /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>@([\S\s]*?)<\/span>/gi,
    '@[$3]($2)'
  );
}
