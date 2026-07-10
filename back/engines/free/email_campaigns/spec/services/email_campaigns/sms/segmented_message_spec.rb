# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::SegmentedMessage do
  let(:euro) { '€' }                # GSM-7 extension set: costs two septets
  let(:cyrillic) { 'ж' }            # outside GSM-7: forces UCS-2
  let(:polish_l) { 'ł' }            # outside GSM-7
  let(:emoji) { "\u{1F600}" }       # grinning face: a surrogate pair, two UTF-16 code units
  let(:cup) { "\u{1F964}" }         # cup with straw
  let(:strawberry) { "\u{1F353}" }  # strawberry

  # Spelled as escapes because these two are indistinguishable on screen.
  let(:combining_e_acute) { "e\u0301" }   # "e" + COMBINING ACUTE ACCENT
  let(:precomposed_e_acute) { "\u00E9" }  # the single character GSM-7 covers

  describe '#encoding_name' do
    it 'is GSM-7 for characters in the GSM 03.38 basic set' do
      expect(described_class.new('Hello world').encoding_name).to eq('GSM-7')
    end

    it 'is GSM-7 for the accented characters that the basic set covers' do
      expect(described_class.new("Caf#{precomposed_e_acute}").encoding_name).to eq('GSM-7')
    end

    it 'is GSM-7 for the extension set' do
      expect(described_class.new("{cost: #{euro}5}").encoding_name).to eq('GSM-7')
    end

    it 'is UCS-2 as soon as one character falls outside GSM-7' do
      expect(described_class.new("Prijs: 5 z#{polish_l}").encoding_name).to eq('UCS-2')
    end

    it 'is UCS-2 for an emoji' do
      expect(described_class.new("Smoothies #{cup}").encoding_name).to eq('UCS-2')
    end

    it 'is UCS-2 for scripts outside the basic set' do
      expect(described_class.new(cyrillic * 3).encoding_name).to eq('UCS-2')
    end

    it 'is UCS-2 for a combining sequence, even though its base letter is GSM-7' do
      # "e" + U+0301 renders as an accented e, but it is not the precomposed U+00E9 that
      # GSM-7 covers, so it forces the whole message to UCS-2.
      expect(described_class.new(combining_e_acute).encoding_name).to eq('UCS-2')
      expect(described_class.new(precomposed_e_acute).encoding_name).to eq('GSM-7')
    end

    it 'is GSM-7 for an empty body' do
      expect(described_class.new('').encoding_name).to eq('GSM-7')
    end
  end

  describe '#segments_count' do
    context 'with GSM-7 (160 per single segment, 153 per concatenated segment)' do
      it 'fits 160 characters in one segment' do
        expect(described_class.new('a' * 160).segments_count).to eq(1)
      end

      it 'splits at 161 characters' do
        expect(described_class.new('a' * 161).segments_count).to eq(2)
      end

      it 'fits 306 characters in two segments' do
        expect(described_class.new('a' * 306).segments_count).to eq(2)
      end

      it 'splits at 307 characters' do
        expect(described_class.new('a' * 307).segments_count).to eq(3)
      end

      it 'fits 459 characters in three segments' do
        expect(described_class.new('a' * 459).segments_count).to eq(3)
      end
    end

    context 'with UCS-2 (70 per single segment, 67 per concatenated segment)' do
      it 'fits 70 characters in one segment' do
        expect(described_class.new(cyrillic * 70).segments_count).to eq(1)
      end

      it 'splits at 71 characters' do
        expect(described_class.new(cyrillic * 71).segments_count).to eq(2)
      end

      it 'fits 134 characters in two segments' do
        expect(described_class.new(cyrillic * 134).segments_count).to eq(2)
      end

      it 'splits at 135 characters' do
        expect(described_class.new(cyrillic * 135).segments_count).to eq(3)
      end

      it 'counts an emoji as two code units' do
        expect(described_class.new(emoji * 35).segments_count).to eq(1)
        expect(described_class.new(emoji * 36).segments_count).to eq(2)
      end
    end

    context 'with the GSM-7 extension set, which costs two septets per character' do
      it 'fits 80 euro signs in one segment' do
        expect(described_class.new(euro * 80).segments_count).to eq(1)
      end

      it 'splits at 81 euro signs' do
        expect(described_class.new(euro * 81).segments_count).to eq(2)
      end
    end

    # A two-unit character is atomic: it cannot straddle a segment boundary. A segment
    # with a single unit free must leave it empty and start a new one. Dividing the total
    # length by the capacity misses this and under-counts by a whole segment.
    context 'when a two-unit character lands on a segment boundary' do
      it 'leaves the odd septet unused rather than splitting a euro sign' do
        # 152 septets fill the first segment, leaving one free; a euro sign needs two.
        expect(described_class.new("#{'a' * 152}#{euro * 77}").segments_count).to eq(3)
      end

      it 'packs the euro sign into the first segment when it fits exactly' do
        expect(described_class.new("#{'a' * 151}#{euro * 77}").segments_count).to eq(2)
      end

      it 'leaves the odd code unit unused rather than splitting an emoji' do
        expect(described_class.new("#{cyrillic * 66}#{emoji * 34}").segments_count).to eq(3)
      end

      it 'keeps a short body in one segment' do
        expect(described_class.new("#{cyrillic}#{emoji * 34}").segments_count).to eq(1)
      end
    end

    it 'reports one segment for an empty body' do
      expect(described_class.new('').segments_count).to eq(1)
    end
  end

  describe '#number_of_characters' do
    it 'counts each GSM-7 character once' do
      expect(described_class.new('Hello').number_of_characters).to eq(5)
    end

    it 'counts each GSM-7 extension character twice' do
      expect(described_class.new(euro * 80).number_of_characters).to eq(160)
      expect(described_class.new('a{b}').number_of_characters).to eq(6)
    end

    it 'counts graphemes, not code units, under UCS-2' do
      expect(described_class.new("hello #{emoji}").number_of_characters).to eq(7)
    end
  end

  describe '#non_gsm_characters' do
    it 'is empty when the whole body is GSM-7' do
      expect(described_class.new("Hello {world} #{euro}5").non_gsm_characters).to be_empty
    end

    it 'lists the characters that forced the message into UCS-2' do
      expect(described_class.new("Smoothies #{cup}#{strawberry}").non_gsm_characters)
        .to eq([cup, strawberry])
    end

    it 'does not list the GSM-7 characters that merely share a UCS-2 message' do
      expect(described_class.new("Prijs 5 z#{polish_l}").non_gsm_characters).to eq([polish_l])
    end
  end
end
