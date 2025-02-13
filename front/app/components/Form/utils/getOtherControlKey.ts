// This function is used for fields that have an "other" option,
// which are single and multi select questions.
// The 'main' control will have a key like 'single_choice_o0b'.
// The 'other' control is modeled as a separate field and it will have
// a key like 'single_choice_o0b_other'.
// This function extracts the 'main' control key from the 'other' control key.
// See also the unit test.
function getOtherControlKey(scope: string = ''): string | undefined {
  const regex = /^#\/properties\/(\w+)_other$/;
  const match = scope.match(regex);

  if (match) {
    return match[1];
  }

  return undefined;
}

export default getOtherControlKey;
