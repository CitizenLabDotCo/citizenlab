// This function is used for fields that have a "follow up" text field,
// which is currently only used for sentiment linear scale questions.
// The 'main' control will have a key like 'sentiment_linear_scale_o0b'.
// The 'follow up' control is modeled as a separate field and it will have
// a key like 'sentiment_linear_scale_o0b_follow_up'.
// This function extracts the 'main' control key from the 'follow up' control key.
function getFollowUpControlKey(scope: string = ''): string | undefined {
  const regex = /^#\/properties\/(\w+)_follow_up$/;
  const match = scope.match(regex);

  if (match) {
    return match[1];
  }

  return undefined;
}

export default getFollowUpControlKey;
