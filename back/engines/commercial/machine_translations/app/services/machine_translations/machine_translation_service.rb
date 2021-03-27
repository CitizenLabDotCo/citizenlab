module MachineTranslations
  class MachineTranslationService

    def build_translation_for translatable:, attribute_name:, locale_to:
      multiloc = translatable[attribute_name]
      locale_from = multiloc_to_locale_from multiloc
      text_or_html = multiloc[locale_from]
      MachineTranslation.new(
        translatable: translatable,
        attribute_name: attribute_name, 
        locale_to: locale_to, 
        translation: translate(text_or_html, locale_from, locale_to)
        )
    end

    def assign_new_translation translation
      multiloc = translation.translatable[translation.attribute_name]
      locale_from = multiloc_to_locale_from multiloc
      text_or_html = multiloc[locale_from]
      translation.assign_attributes translation: translate(text_or_html, locale_from, translation.locale_to)
    end

    def multiloc_to_locale_from multiloc
      # It would be nice if we could figure out
      # the better locale to translate from.
      multiloc.keys.first
    end

    def translate text_or_html, locale_from, locale_to, retries: 10
      # Uses Google translate
      from = locale_from[0...2]
      to = locale_to[0...2]
      if from == to
        text_or_html
      else
        while retries > 0
          begin
            return EasyTranslate.translate(text_or_html, :from => from, :to => to)
          rescue EasyTranslate::EasyTranslateException => e
            retries -= 1
            sleep rand(60)
          end
        end
      end
    end
  end
end