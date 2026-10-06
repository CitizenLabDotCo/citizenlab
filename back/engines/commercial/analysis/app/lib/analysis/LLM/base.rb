# frozen_string_literal: true

module Analysis
  module LLM
    class Base
      def self.headroom_ratio
        0.9
      end

      def name
        self.class.name.demodulize.underscore
      end

      # Should return a family key as defined in LLMSelector::FAMILIES
      def self.family
        raise NotImplementedError
      end

      def context_window
        raise NotImplementedError
      end

      # Returns the practical context window size after applying a safety margin.
      # This prevents hitting rate limits and accounts for system overhead, response tokens,
      # and tokenization variance that aren't captured in our initial token estimates.
      def usable_context_window
        (context_window * self.class.headroom_ratio).to_i
      end

      # Float in 0..1 that denotes how relatively accurate the llm is. 1 would
      # be perfect accuracy.
      def accuracy
        raise NotImplementedError
      end

      def chat(prompt, **params)
        raise NotImplementedError
      end

      def chat_async(prompt, **params)
        raise NotImplementedError
      end

      def enabled?
        true
      end

      private

      # A text file is sent as text only when it has no PDF preview to send
      # instead. Formats LibreOffice can convert (txt, csv) keep going through
      # their preview; markdown cannot be converted, so it never gets one.
      # @param file [Files::File]
      def text_without_preview?(file)
        file.text? && file.preview.nil?
      end

      # The uploader hands back ASCII-8BIT bytes, which cannot be joined with
      # UTF-8 prompt text, and the bytes are not guaranteed to be valid UTF-8.
      # @param file [Files::File]
      def text_file_content(file)
        content = file.content.read.force_encoding(Encoding::UTF_8).scrub
        "File: #{file.name}\n\n#{content}"
      end
    end
  end
end
