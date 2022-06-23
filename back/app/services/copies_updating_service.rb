# frozen_string_literal: true

class CopiesUpdatingService
  def update_custom_fields
    scope = CustomField.where(resource_type: User.name)
    %w[gender birthyear domicile education].each do |code|
      scope.where(code: code).find_each do |record|
        update_multiloc_value(record, :title_multiloc, "custom_fields.users.#{code}.title")
      end
    end
  end

  private

  def update_multiloc_value(record, attr_name, copy_path)
    old_multiloc_value = record.public_send(attr_name)
    new_multiloc_value = latest_multiloc_value(copy_path)

    old_multiloc_value.each do |(locale, value)|
      english = locale.starts_with?('en')
      value_translated = value != old_multiloc_value['en']

      new_multiloc_value[locale] = value if english || value_translated
    end

    return if new_multiloc_value == old_multiloc_value

    msg = "#{record.class.name} #{record.id} #{attr_name} from #{old_multiloc_value} to #{new_multiloc_value}"
    if record.update(attr_name => new_multiloc_value)
      Rails.logger.info("Updated #{msg}")
    else
      Rails.logger.error("Failed to update #{msg}")
    end
  end

  def latest_multiloc_value(copy_path)
    CL2_SUPPORTED_LOCALES.each_with_object({}) do |locale, obj|
      obj[locale.to_s] = I18n.with_locale(locale) { I18n.t!(copy_path) }
    end
  end
end
