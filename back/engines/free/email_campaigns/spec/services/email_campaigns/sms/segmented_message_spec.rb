# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::SegmentedMessage do
  # GSM-7 fits 160 septets alone, 153 once a User Data Header is reserved.
  # UCS-2 fits 70 characters alone, 67 once concatenated.
  #
  # The library these expectations come from tests the same behaviour in
  # https://github.com/TwilioDevEd/message-segment-calculator/tree/v1.2.0/tests
  # (index.test.js covers the encodings, sizes and character counts, segments.test.js the
  # User Data Header, methods.test.js the non-GSM characters), and
  # front/app/containers/Admin/messaging/Sms/utils/smsSegmentParity.test.ts pins the
  # fixture below against the library itself.
  describe 'parity with the JS library the admin UI counts with' do
    let(:fixture) do
      path = Rails.root.join('engines/free/email_campaigns/spec/fixtures/sms_segment_parity.json')
      JSON.parse(path.read)
    end

    def measure(body)
      message = described_class.new(body)

      {
        'segmentsCount' => message.segments_count,
        'encodingName' => message.encoding_name,
        'messageSize' => message.message_size,
        'totalSize' => message.total_size,
        'numberOfCharacters' => message.number_of_characters,
        'numberOfUnicodeScalars' => message.number_of_unicode_scalars,
        'nonGsmCharacters' => message.non_gsm_characters,
        'segmentSizes' => message.segments.map(&:size_in_bits)
      }
    end

    it 'reproduces every recorded measurement' do
      mismatches = fixture['cases'].filter_map do |expected|
        body = expected['body']
        recorded = expected.except('description', 'body')
        actual = measure(body)
        next if actual == recorded

        { case: expected['description'], body: body.inspect, expected: recorded, actual: actual }
      end

      expect(mismatches).to eq([])
    end

    # Without this, a truncated or empty fixture would let the check above pass vacuously.
    it 'still holds a full corpus' do
      expect(fixture['cases'].size).to be > 50
    end
  end

  describe '#segments_count' do
    it 'counts an empty body as a single segment' do
      expect(described_class.new('').segments_count).to eq(1)
    end

    it 'fits 160 GSM-7 characters in one segment' do
      expect(described_class.new('a' * 160).segments_count).to eq(1)
    end

    it 'splits at 161 GSM-7 characters, once the header takes 7 septets from the first segment' do
      expect(described_class.new('a' * 161).segments_count).to eq(2)
    end

    it 'fits 153 GSM-7 characters per concatenated segment' do
      expect(described_class.new('a' * 306).segments_count).to eq(2)
      expect(described_class.new('a' * 307).segments_count).to eq(3)
    end

    it 'fits 70 UCS-2 characters in one segment' do
      expect(described_class.new('ж' * 70).segments_count).to eq(1)
      expect(described_class.new('ж' * 71).segments_count).to eq(2)
    end

    it 'fits 67 UCS-2 characters per concatenated segment' do
      expect(described_class.new('ж' * 134).segments_count).to eq(2)
      expect(described_class.new('ж' * 135).segments_count).to eq(3)
    end

    it 'charges two septets for a GSM-7 extension character' do
      expect(described_class.new("#{'a' * 158}€").segments_count).to eq(1)
      expect(described_class.new("#{'a' * 159}€").segments_count).to eq(2)
    end

    it 'never splits a character across a segment boundary' do
      # A surrogate pair costs 2 of the 70 UCS-2 units, so 68 characters plus an
      # emoji fills the segment exactly and one more pushes the whole pair over.
      expect(described_class.new("#{'a' * 68}😀").segments_count).to eq(1)
      expect(described_class.new("#{'a' * 69}😀").segments_count).to eq(2)
    end

    it 'keeps a multi-codepoint emoji whole' do
      expect(described_class.new('👨‍👩‍👧').segments_count).to eq(1)
      expect(described_class.new('👨‍👩‍👧' * 9).segments_count).to eq(2)
    end
  end

  describe '#encoding_name' do
    it 'stays on GSM-7 for characters in the GSM-7 alphabet' do
      expect(described_class.new('Café? Non: Ωmega @ 100€').encoding_name).to eq('GSM-7')
    end

    it 'switches to UCS-2 for a character outside it' do
      expect(described_class.new('naïve').encoding_name).to eq('UCS-2')
    end

    it 'switches to UCS-2 for a curly quote, which we do not transliterate' do
      expect(described_class.new('the “Parc de l’Ouest” project').encoding_name).to eq('UCS-2')
    end
  end

  describe '#non_gsm_characters' do
    it 'reports the characters that forced UCS-2' do
      expect(described_class.new('naïve café').non_gsm_characters).to eq(['ï'])
    end

    it 'is empty for a GSM-7 body' do
      expect(described_class.new('plain text').non_gsm_characters).to be_empty
    end
  end

  describe '#exceeds_limit?' do
    it 'allows a body of exactly the maximum number of segments' do
      expect(described_class.new('a' * (153 * described_class::MAX_SEGMENTS))).not_to be_exceeds_limit
    end

    it 'flags a body one character over' do
      expect(described_class.new('a' * ((153 * described_class::MAX_SEGMENTS) + 1))).to be_exceeds_limit
    end
  end
end
