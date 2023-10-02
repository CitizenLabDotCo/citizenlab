import { IInappropriateContentFlagData } from 'api/inappropriate_content_flags/types';

export function getFlagType(flag: IInappropriateContentFlagData) {
  // A flag could be both user and NLP flagged at the same time
  // Reporting NLP flagging has precedence.

  // If the reason_code is null, the flag has been removed
  if (flag.attributes.reason_code !== null) {
    // If flag has toxicity_label, we know for sure it's NLP flagged
    if (flag.attributes.toxicity_label) {
      return 'nlp_flagged';
    } else {
      // If toxicity_label is null, yet we have a flag with a reason_code that is not null,
      // we know it's user reported
      return 'user_flagged';
    }
  }

  return null;
}
