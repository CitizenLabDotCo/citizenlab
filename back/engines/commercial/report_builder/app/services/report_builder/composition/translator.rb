# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Fills in the platform's other locales for text a run wrote in one.
    #
    # The composition itself stays single-locale on purpose: a report argued once
    # reads better than the same report argued five times over, and every extra
    # language in the run is another thing for it to get wrong halfway through.
    # Translating what it wrote afterwards keeps the reasoning in one language and
    # still gives every reader their own.
    #
    # A failed translation is not worth losing a composition over, so it leaves the
    # text in the locale it was written in and reports itself.
    class Translator
      MODEL_ID = ENV.fetch('BEDROCK_SONNET_MODEL', 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0')

      # @param locale [String] the locale the run wrote in.
      # @param locales [Array<String>, nil] every locale to end up with. The
      #   platform's own by default.
      # @param chat [#ask, nil] the model to translate with.
      def initialize(locale:, locales: nil, chat: nil)
        @locale = locale
        @locales = locales
        @chat = chat
      end

      # @param texts [Hash{String=>String}] id => the text as the run wrote it. The
      #   ids are opaque: the model only has to hand them back.
      # @return [Hash{String=>Hash{String=>String}}] id => multiloc, always carrying
      #   the locale the run wrote in, whatever else came back.
      def call(texts)
        written = texts.select { |_, text| text.is_a?(String) && text.present? }
        multilocs = written.transform_values { |text| { @locale => text } }
        return multilocs if multilocs.empty? || targets.empty?

        translations = translate(written)
        multilocs.to_h do |id, multiloc|
          filled = targets.index_with { |target| translations.dig(target, id) }
          [id, multiloc.merge(filled.compact_blank)]
        end
      end

      private

      def targets
        @targets ||= locales.map(&:to_s) - [@locale]
      end

      def locales
        @locales.presence ||
          AppConfiguration.instance.settings('core', 'locales').presence ||
          [@locale]
      end

      def translate(texts)
        reply = chat.ask(prompt(texts)).content.to_s
        # The model is asked for one JSON object; taking the outermost braces makes a
        # code fence or a line of preamble harmless.
        JSON.parse(reply[/\{.*\}/m].to_s).slice(*targets)
      rescue StandardError => e
        ErrorReporter.report(e, extra: { locale: @locale, targets: targets, ids: texts.keys })
        {}
      end

      def prompt(texts)
        <<~PROMPT
          Translate the texts below out of #{@locale} and into each of: #{targets.join(', ')}.

          They are the text of a report a local government publishes to its residents.
          Translate for a reader of that language rather than word by word, and keep the
          register: plain, factual, no marketing.

          - Leave HTML tags and their attributes exactly as they are, and translate only
            the text between them.
          - Leave anything inside {curly braces} exactly as it is: it is a placeholder.
          - Keep the punctuation each text ends with.
          - Do not add or drop sentences, and leave proper names alone.

          The texts are a JSON object of id to text:

          #{JSON.pretty_generate(texts)}

          Answer with one JSON object and nothing else: each locale code above as a key,
          holding an object with exactly the same ids and the translated text as values.
        PROMPT
      end

      def chat
        @chat ||= RubyLLM.chat(model: MODEL_ID, provider: :bedrock, assume_model_exists: true)
      end
    end
  end
end
