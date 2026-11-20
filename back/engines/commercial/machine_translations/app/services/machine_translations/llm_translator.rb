# frozen_string_literal: true

module MachineTranslations
  # Translates plain text or HTML with the LLM of the `content_translation` use case.
  class LLMTranslator
    USE_CASE = 'content_translation'

    # Wide enough for all rich text editors. The record that stores the result sanitizes it again
    # with its own rules.
    HTML_FEATURES = %i[title alignment list decoration link image video mention table].freeze

    def initialize(llm: nil)
      @llm = llm || LLMSelector.new.llm_class_for_use_case(USE_CASE).new
    end

    # @param html [Boolean, nil] Whether the text is HTML. When nil, the translator detects it.
    # @return [String] The sanitized translation.
    def translate(text_or_html, locale_from, locale_to, html: nil)
      return text_or_html if text_or_html.blank?
      return text_or_html if Locale.new(locale_from).language == Locale.new(locale_to).language

      html = html?(text_or_html) if html.nil?
      prompt = Analysis::LLM::Prompt.new.fetch(
        USE_CASE,
        text: text_or_html,
        html: html,
        locale_from: describe_locale(locale_from),
        locale_to: describe_locale(locale_to)
      )

      sanitize(clean_response(@llm.chat(prompt).to_s), html: html)
    end

    # @return [Hash{String => String}] The translation per target locale.
    def translate_to_locales(text_or_html, locale_from, locales_to, html: nil)
      locales_to.index_with { |locale_to| translate(text_or_html, locale_from, locale_to, html: html) }
    end

    private

    def describe_locale(locale)
      "#{Locale.new(locale).language_copy} (#{locale})"
    end

    def html?(text)
      Nokogiri::HTML.fragment(text).children.any?(&:element?)
    end

    # Remove the wrappers that models sometimes add, although the prompt tells them not to.
    def clean_response(response)
      response
        .strip
        .delete_prefix('<content>').delete_suffix('</content>').strip
        .sub(/\A```\w*\n/, '').delete_suffix("\n```")
        .strip
    end

    def sanitize(text, html:)
      sanitization_service = SanitizationService.new
      if html
        sanitization_service.sanitize(text, HTML_FEATURES)
      else
        sanitization_service.strip_to_plain_text(text)
      end
    end
  end
end
