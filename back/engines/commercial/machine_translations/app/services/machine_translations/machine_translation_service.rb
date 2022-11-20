# frozen_string_literal: true

module MachineTranslations
  class MachineTranslationService
    def build_translation_for(translatable:, attribute_name:, locale_to:)
      multiloc = translatable[attribute_name]
      return nil if multiloc.nil?

      locale_from = multiloc_to_locale_from multiloc
      text_or_html = multiloc[locale_from]
      MachineTranslation.new(
        translatable: translatable,
        attribute_name: attribute_name,
        locale_to: locale_to,
        translation: translate(text_or_html, locale_from, locale_to)
      )
    end

    def assign_new_translation(translation)
      multiloc = translation.translatable[translation.attribute_name]
      locale_from = multiloc_to_locale_from multiloc
      text_or_html = multiloc[locale_from]
      translation.assign_attributes translation: translate(text_or_html, locale_from, translation.locale_to)
    end

    def multiloc_to_locale_from(multiloc)
      # It would be nice if we could figure out
      # the better locale to translate from.
      multiloc.keys.first
    end

    def translate(text_or_html, locale_from, locale_to, retries: 0, max_sleep: 60)
      # Uses Google translate
      from = locale_from[0...2]
      to = locale_to[0...2]

      return text_or_html if from == to

      translation = nil
      exception = nil
      (retries + 1).times do |i|
        translation = EasyTranslate.translate text_or_html, from: from, to: to
        break
      rescue EasyTranslate::EasyTranslateException => e
        exception = e
        sleep rand(max_sleep + 1) if i < retries
      end

      if translation.present?
        fix_html translation
      elsif exception
        raise exception
      else
        ''
      end
    end

    private

    def fix_html(text_or_html)
      doc = Nokogiri::HTML.fragment text_or_html
      plain_text = doc.text == text_or_html
      return text_or_html if plain_text

      doc.errors.any? ? doc.to_s : text_or_html
    end
  end
end
