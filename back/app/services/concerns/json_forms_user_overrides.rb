module JsonFormsUserOverrides
  extend ActiveSupport::Concern

  def user_to_ui_schema fields, locale='en'
    {
      type: 'VerticalLayout',
      options: {
        formId: 'user-form',
      },
      elements: fields.map{|f| yield f}.compact
    }
  end

  def user_domicile_to_json_schema_field field, locale
    output = select_to_json_schema_field(field, locale)

    output[:oneOf] = Area.all.order(created_at: :desc).map do |area|
      {
        const: area.id,
        title: @multiloc_service.t(area.title_multiloc)
      }
    end.push({
      const: 'outside',
      title: I18n.t('custom_field_options.domicile.outside')
    })

    output
  end

  def user_birthyear_to_json_schema_field field, locale
    output = number_to_json_schema_field(field, locale)
    output[:oneOf] = (1900..(Time.now.year - 12)).to_a.reverse.map{|y| {const: y}}
    output
  end

end
