import { SegmentedMessage } from 'sms-segments-calculator';

// Max segments per SMS body. Client-side cap for now; server-side guard follows.
export const MAX_SMS_SEGMENTS = 8;

const GSM_7 = 'GSM-7';

// Per-segment capacity: 160/70 alone, 153/67 concatenated (each reserves a header).
const SINGLE_SEGMENT_CAPACITY = { gsm7: 160, unicode: 70 };
const CONCATENATED_SEGMENT_CAPACITY = { gsm7: 153, unicode: 67 };

export interface SmsSegments {
  // Billable units: GSM-7 septets or UTF-16 code units (emoji = 2), not characters.
  unitsUsed: number;
  capacity: number;
  perSegment: number;
  segmentCount: number;
  isUnicode: boolean;
  // Distinct characters that forced Unicode encoding.
  nonGsmCharacters: string[];
  exceedsLimit: boolean;
}

// Uses Twilio's calculator so the counts match what the admin is billed for.
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
    // messageSize is bits excluding headers; divide to get units used.
    unitsUsed: message.messageSize / bitsPerUnit,
    capacity: segmentCount * perSegment,
    perSegment,
    segmentCount,
    isUnicode,
    nonGsmCharacters: [...new Set(message.getNonGsmCharacters())],
    exceedsLimit: segmentCount > MAX_SMS_SEGMENTS,
  };
};
