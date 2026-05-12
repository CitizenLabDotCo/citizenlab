export function formatCommentContent(commentBody: string) {
  return commentBody.replace(
    // We only link user profiles if data-show-profile=true OR data-show-profile is absent (legacy from when all profiles were shown)
    /<span\sclass="cl-mention-user"(?![^>]*?data-link-profile=(?!['"]true['"])['"][^'"]*?['"])[^>]*?data-user-id="([\S\s]*?)"[^>]*?>([\S\s]*?)<\/span>/gi,
    '<a class="mention" data-link="/profile/$1" href="/profile/$1">$2</a>'
  );
}

export function formatEditableCommentContent(commentBody: string) {
  return commentBody.replace(
    /<span\sclass="cl-mention-user"[^>]*?data-user-id="([^"]*?)"[^>]*?>@([\S\s]*?)<\/span>/gi,
    '@[$2]($1)'
  );
}
