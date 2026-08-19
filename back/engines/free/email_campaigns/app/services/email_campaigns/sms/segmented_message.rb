# frozen_string_literal: true

module EmailCampaigns
  module Sms
    # Ruby port of the `sms-segments-calculator` package the admin UI counts with, so the
    # server-side count matches the one the author was shown. Both sides are checked
    # against the bodies in spec/fixtures/sms_segment_parity.json.
    #
    # Ported from src/libs/SegmentedMessage.ts (and its EncodedChar/Segment/UserDataHeader
    # siblings) at v1.2.0, the version front/package.json pins:
    # https://github.com/TwilioDevEd/message-segment-calculator/tree/v1.2.0/src/libs
    class SegmentedMessage
      MAX_SEGMENTS = 8

      GSM7 = 'GSM-7'
      UCS2 = 'UCS-2'

      # A segment carries 140 octets.
      SEGMENT_SIZE_IN_BITS = 1120
      # Concatenated segments reserve 6 of those octets for a User Data Header.
      USER_DATA_HEADER_OCTETS = 6

      attr_reader :graphemes, :encoding_name, :encoded_chars, :segments,
        :number_of_characters, :number_of_unicode_scalars

      def initialize(body)
        @graphemes = body.grapheme_clusters
        @number_of_unicode_scalars = body.length
        @encoding_name = any_ucs2_characters? ? UCS2 : GSM7
        @encoded_chars = @graphemes.map { |grapheme| EncodedChar.new(grapheme, @encoding_name) }
        @number_of_characters =
          @encoding_name == UCS2 ? @graphemes.size : @encoded_chars.sum { |char| char.code_units.size }
        @segments = build_segments
      end

      # JS strings are UTF-16, and the library indexes characters by code unit.
      def self.utf16_code_units(string)
        string.encode(Encoding::UTF_16BE).unpack('n*')
      end

      def segments_count
        segments.size
      end

      def exceeds_limit?
        segments_count > MAX_SEGMENTS
      end

      # Size in bits including each segment's User Data Header.
      def total_size
        segments.sum(&:size_in_bits)
      end

      # Size in bits excluding each segment's User Data Header.
      def message_size
        segments.sum(&:message_size_in_bits)
      end

      # The characters that forced the message onto UCS-2.
      def non_gsm_characters
        encoded_chars.reject(&:gsm7?).map(&:raw)
      end

      private

      # A grapheme spanning more than one code unit can never be GSM-7.
      def any_ucs2_characters?
        graphemes.any? do |grapheme|
          code_units = self.class.utf16_code_units(grapheme)
          code_units.size >= 2 || !UnicodeToGsm::MAP.key?(code_units.first)
        end
      end

      # Fills segments in order, never splitting a character across two of them.
      # The first segment only learns it needs a User Data Header once a second
      # segment opens, so the header is retro-fitted and the characters it
      # displaces move to the new segment.
      def build_segments
        segments = [Segment.new]

        encoded_chars.each do |encoded_char|
          current = segments.last

          if current.free_size_in_bits < encoded_char.size_in_bits
            previous = current
            current = Segment.new(with_user_data_header: true)
            segments << current
            previous.add_header.each { |displaced| current.push(displaced) } unless previous.user_data_header?
          end

          current.push(encoded_char)
        end

        segments
      end

      # One grapheme, encoded.
      class EncodedChar
        attr_reader :raw, :code_units

        def initialize(raw, encoding_name)
          @raw = raw
          @encoding_name = encoding_name
          gsm_code_units = UnicodeToGsm::MAP[SegmentedMessage.utf16_code_units(raw).first]
          @gsm7 = !gsm_code_units.nil?
          @code_units = gsm_code_units || SegmentedMessage.utf16_code_units(raw)
        end

        def gsm7?
          @gsm7
        end

        def size_in_bits
          # Keyed off the first code unit: a grapheme starting with a GSM-7 character costs
          # 16 bits however many units it spans (`1️⃣`, decomposed `é`).
          return 16 if @encoding_name == UCS2 && gsm7?

          bits_per_code_unit = @encoding_name == GSM7 ? 7 : 16
          bits_per_code_unit * code_units.size
        end
      end

      # The 6 octets a concatenated segment reserves to describe its position.
      class UserDataHeader
        def size_in_bits
          8
        end
      end

      class Segment
        def initialize(with_user_data_header: false)
          @chars = []
          @user_data_header = with_user_data_header
          USER_DATA_HEADER_OCTETS.times { @chars << UserDataHeader.new } if with_user_data_header
        end

        def user_data_header?
          @user_data_header
        end

        def push(char)
          @chars << char
        end

        def size_in_bits
          @chars.sum(&:size_in_bits)
        end

        def message_size_in_bits
          @chars.reject { |char| char.is_a?(UserDataHeader) }.sum(&:size_in_bits)
        end

        def free_size_in_bits
          SEGMENT_SIZE_IN_BITS - size_in_bits
        end

        # @return [Array<EncodedChar>] the characters the header pushed out, in order
        def add_header
          return [] if user_data_header?

          USER_DATA_HEADER_OCTETS.times { @chars.unshift(UserDataHeader.new) }
          @user_data_header = true

          displaced = []
          displaced.unshift(@chars.pop) while free_size_in_bits.negative?
          displaced
        end
      end
    end
  end
end
