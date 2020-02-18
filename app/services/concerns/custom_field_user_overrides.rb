module CustomFieldUserOverrides
  extend ActiveSupport::Concern

  def user_domicile_to_json_schema_field field, locale
    normal_field = select_to_json_schema_field(field, locale)
    areas = Area.all.order(created_at: :desc)
    normal_field[:enum] = areas.map(&:id).push('outside')
    I18n.with_locale(locale) do
      normal_field[:enumNames] = areas.map do |area|
        @multiloc_service.t(area.title_multiloc)
      end.push(I18n.t('custom_field_options.domicile.outside'))
    end
    normal_field
  end

  def user_birthyear_to_json_schema_field field, locale
    normal_field = number_to_json_schema_field(field, locale)
    normal_field[:enum] = (1900..(Time.now.year - 12)).to_a.reverse
    normal_field
  end

end
