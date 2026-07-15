import { SegmentedMessage } from 'sms-segments-calculator';

// The cap on how many segments a single SMS body may cost. Enforced client-side only
// for now (the compose form blocks going over); a matching server-side guard will land
// with the backend segment checks in a later PR.
export const MAX_SMS_SEGMENTS = 8;

const GSM_7 = 'GSM-7';

// A segment carries 140 octets = 1120 bits: 160 GSM-7 characters, or 70 Unicode ones.
// Once a message spans several segments each reserves a 48-bit header, leaving 153 and 67.
const SINGLE_SEGMENT_CAPACITY = { gsm7: 160, unicode: 70 };
const CONCATENATED_SEGMENT_CAPACITY = { gsm7: 153, unicode: 67 };

export interface SmsSegments {
  // What the message occupies, in the units a segment is measured in: septets under
  // GSM-7, UTF-16 code units under Unicode. NOT a character count -- an emoji is one
  // character but two code units, so counting characters would show a full segment as
  // half empty.
  unitsUsed: number;
  // How much those segments can hold in total. Moves as you type: 160 for a single
  // segment, then 153 per segment, and less than half of that under Unicode.
  capacity: number;
  perSegment: number;
  segmentCount: number;
  isUnicode: boolean;
  // The characters that pushed the message out of GSM-7, deduplicated.
  nonGsmCharacters: string[];
  exceedsLimit: boolean;
}

// Runs Twilio's own calculator, so the numbers an admin sees are the ones they are
// billed for. The backend mirrors this to guard the send endpoint.
export const measureSms = (body: string): SmsSegments => {
  const message = new SegmentedMessage(body);

  const isUnicode = message.encodingName !== GSM_7;
  const bitsPerUnit = isUnicode ? 16 : 7;
  const segmentCount = message.segmentsCount;

  const perSegment =
    segmentCount === 1
      ? SINGLE_SEGMENT_CAPACITY[isUnicode ? 'unicode' : 'gsm7']
      : CONCATENATED_SEGMENT_CAPACITY[isUnicode ? 'unicode' : 'gsm7'];

  return {
    // messageSize is the body's size in bits, excluding the segment headers.
    unitsUsed: message.messageSize / bitsPerUnit,
    capacity: segmentCount * perSegment,
    perSegment,
    segmentCount,
    isUnicode,
    nonGsmCharacters: [...new Set(message.getNonGsmCharacters())],
    exceedsLimit: segmentCount > MAX_SMS_SEGMENTS,
  };
};
