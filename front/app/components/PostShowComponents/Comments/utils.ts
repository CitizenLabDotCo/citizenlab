import { fetchUserById } from 'api/users/useUserById';
import { getFullName } from 'utils/textUtils';

const MENTION_REGEX_WITHOUT_AT =
  /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>([\S\s]*?)<\/span>/gi;

export async function getCommentContent(commentBody: string) {
  const userId = MENTION_REGEX_WITHOUT_AT.exec(commentBody)?.[1];

  if (!userId) {
    return commentBody.replace(
      MENTION_REGEX_WITHOUT_AT,
      '<a class="mention" data-link="/profile/$2" href="/profile/$2">$3</a>'
    );
  }

  const user = await fetchUserById({ id: userId });
  const { slug } = user.data.attributes;

  return commentBody.replace(
    MENTION_REGEX_WITHOUT_AT,
    `<a class="mention" data-link="/profile/${slug}" href="/profile/${slug}">@${getFullName(
      user.data
    )}</a>`
  );
}

const MENTION_REGEX_WITH_AT =
  /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>@([\S\s]*?)<\/span>/gi;

export function getEditableCommentContent(commentBody: string) {
  return commentBody.replace(MENTION_REGEX_WITH_AT, '@[$3]($2)');
}
