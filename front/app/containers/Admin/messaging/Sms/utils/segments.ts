import { SegmentedMessage } from 'sms-segments-calculator';
import { Multiloc, SupportedLocale } from 'typings';

import { getLocalized } from 'utils/i18n';

// Max segments per SMS body. Mirrored server-side by SegmentedMessage::MAX_SEGMENTS,
// a Ruby port of this library kept in parity by a shared golden fixture.
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

// Credits a send would cost: every recipient is billed for the segments of the
// body in their own locale, so a long translation costs more than a short one.
export const creditsForSend = (
  bodyMultiloc: Multiloc,
  countByLocale: Record<string, number>,
  tenantLocales: SupportedLocale[]
): number =>
  Object.entries(countByLocale).reduce((credits, [locale, count]) => {
    const body = getLocalized(
      bodyMultiloc,
      locale as SupportedLocale,
      tenantLocales
    );

    return credits + count * measureSms(body).segmentCount;
  }, 0);
