module MachineTranslations
  class MachineTranslationService

    def create_translation_for translatable_type:, translatable_id:, attribute_name:, locale_to:
      translatable = translatable_type.constantize.find translatable_id
      # TODO if no translatable found, throw 422 or something
      multiloc = translatable[attribute_name]
      locale_from = multiloc_to_locale_from multiloc
      text_or_html = multiloc[locale_from]
      MachineTranslation.create!(
        translatable_type: translatable_type, 
        translatable_id: translatable_id, 
        attribute_name: attribute_name, 
        locale_to: locale_to, 
        translation: translate(text_or_html, locale_from, locale_to)
        )
    end

    def update_translation translation
      multiloc = translation.translatable[translation.attribute_name]
      locale_from = multiloc_to_locale_from multiloc
      text_or_html = multiloc[locale_from]
      translation.update! translation: translate(text_or_html, locale_from, translation.locale_to)
    end

    def multiloc_to_locale_from multiloc
      multiloc.keys.first
    end

    def translate text_or_html, locale_from, locale_to
      # uses Google translate
      EasyTranslate.translate(text_or_html, :from => locale_from[0...2], :to => locale_to[0...2])
    end
  end
end