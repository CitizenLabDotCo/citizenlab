# frozen_string_literal: true

module EmailCampaigns
  module Sms
    # Works out how many SMS segments a message body costs, and in which encoding it
    # will be sent. SMS is billed per segment, so a 161-character message costs twice
    # as much as a 160-character one, and a single emoji can double the cost of an
    # entire message by forcing it out of GSM-7 into UCS-2.
    #
    #   message = SegmentedMessage.new('Hello 😀')
    #   message.segments_count      # => 1
    #   message.encoding_name       # => 'UCS-2'
    #   message.non_gsm_characters  # => ['😀']
    #
    # Mirrors Twilio's reference implementation, which the admin UI runs client-side to
    # show a live counter (npm `sms-segments-calculator`). The two must agree, since we
    # persist this value on Sms::Delivery; segmented_message_spec.rb pins the boundaries.
    #
    # Note this is an estimate of what Twilio will bill. If a tenant has enabled Smart
    # Encoding on their Messaging Service (a console-side setting we cannot read), Twilio
    # transliterates characters like curly quotes into GSM-7 before sending, and may bill
    # fewer segments than we count. We never under-count.
    class SegmentedMessage
      GSM_7 = 'GSM-7'
      UCS_2 = 'UCS-2'

      # GSM 03.38 basic set. One septet each.
      GSM_BASIC = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !\"#¤%&'()*+,-./" \
                  '0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿' \
                  'abcdefghijklmnopqrstuvwxyzäöñüà'

      # GSM 03.38 extension set. Sent as an escape byte followed by the character, so
      # each costs *two* septets and counts as two characters towards the limit.
      GSM_EXTENDED = "\f^{}\\[~]|€"

      # A segment carries 140 octets = 1120 bits of user data: 160 GSM-7 septets, or
      # 70 UCS-2 code units.
      SINGLE_SEGMENT_CAPACITY = { GSM_7 => 160, UCS_2 => 70 }.freeze

      # Once a message spans several segments, every segment reserves a 6-octet User
      # Data Header so the handset can reassemble them in order. That leaves
      # 1120 - 48 = 1072 bits: 153 GSM-7 septets, or 67 UCS-2 code units.
      CONCATENATED_SEGMENT_CAPACITY = { GSM_7 => 153, UCS_2 => 67 }.freeze

      attr_reader :encoding_name, :graphemes

      def initialize(body)
        # Grapheme clusters, not characters: a combining pair like "e" + U+0301 occupies
        # two code units but cannot be split across a segment boundary.
        @graphemes = body.to_s.grapheme_clusters
        @encoding_name = @graphemes.all? { |grapheme| gsm_7?(grapheme) } ? GSM_7 : UCS_2
      end

      # The number of SMS this body will be billed as.
      def segments_count
        sizes = @graphemes.map { |grapheme| size_in_units(grapheme) }
        return 1 if sizes.sum <= SINGLE_SEGMENT_CAPACITY.fetch(encoding_name)

        pack_into_segments(sizes, CONCATENATED_SEGMENT_CAPACITY.fetch(encoding_name))
      end

      # Informational character count. Every character counts as one, except those in the
      # GSM-7 extension set, which count as two.
      def number_of_characters
        return @graphemes.size if encoding_name == UCS_2

        @graphemes.sum { |grapheme| GSM_EXTENDED.include?(grapheme) ? 2 : 1 }
      end

      # The characters that are not representable in GSM-7, and therefore forced the whole
      # message into UCS-2. Surfaced to admins so they can swap them out.
      def non_gsm_characters
        @graphemes.reject { |grapheme| gsm_7?(grapheme) }
      end

      private

      # Fills segments greedily. A character never straddles a boundary, so a segment with
      # one septet free cannot take a two-septet "€" -- it leaves the septet unused and
      # starts a new segment. That is why this packs rather than dividing by the capacity.
      def pack_into_segments(sizes, capacity)
        segments = 1
        used = 0

        sizes.each do |size|
          if used + size > capacity
            segments += 1
            used = 0
          end
          used += size
        end

        segments
      end

      def gsm_7?(grapheme)
        grapheme.length == 1 && (GSM_BASIC.include?(grapheme) || GSM_EXTENDED.include?(grapheme))
      end

      # A character's cost: septets under GSM-7, UTF-16 code units under UCS-2 (where an
      # astral character such as an emoji is a surrogate pair, costing two).
      def size_in_units(grapheme)
        return grapheme.encode(Encoding::UTF_16BE).bytesize / 2 if encoding_name == UCS_2

        GSM_EXTENDED.include?(grapheme) ? 2 : 1
      end
    end
  end
end
