// Checks the JS library (https://github.com/TwilioDevEd/message-segment-calculator)
// against the shared fixture. The Ruby port of that library is checked against the same
// fixture in back/engines/free/email_campaigns/spec/services/email_campaigns/sms/
// segmented_message_spec.rb, so a drift on either side fails here or there.
import fs from 'fs';
import path from 'path';

import { SegmentedMessage } from 'sms-segments-calculator';

const FIXTURE_PATH = path.resolve(
  __dirname,
  '../../../../../../../back/engines/free/email_campaigns/spec/fixtures/sms_segment_parity.json'
);

interface Measurements {
  segmentsCount: number;
  encodingName: string;
  messageSize: number;
  totalSize: number;
  numberOfCharacters: number;
  numberOfUnicodeScalars: number;
  nonGsmCharacters: string[];
  segmentSizes: number[];
}

interface ParityCase extends Measurements {
  description: string;
  body: string;
}

const fixture: { cases: ParityCase[] } = JSON.parse(
  fs.readFileSync(FIXTURE_PATH, 'utf8')
);

const measure = (body: string): Measurements => {
  const message = new SegmentedMessage(body);

  return {
    segmentsCount: message.segmentsCount,
    encodingName: message.encodingName,
    messageSize: message.messageSize,
    totalSize: message.totalSize,
    numberOfCharacters: message.numberOfCharacters,
    numberOfUnicodeScalars: message.numberOfUnicodeScalars,
    nonGsmCharacters: message.getNonGsmCharacters(),
    segmentSizes: message.segments.map((segment) => segment.sizeInBits()),
  };
};

describe('SMS segment parity fixture', () => {
  // `it.each` over an empty corpus generates no tests, so a truncated fixture would pass.
  it('still holds a full corpus', () => {
    expect(fixture.cases.length).toBeGreaterThan(50);
  });

  describe('still matches the expected results', () => {
    const cases = fixture.cases.map(({ description, body, ...recorded }) => ({
      description,
      body,
      recorded,
    }));

    it.each(cases)('$description', ({ body, recorded }) => {
      expect(measure(body)).toEqual(recorded);
    });
  });
});
