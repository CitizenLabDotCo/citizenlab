module JsonFormsIdeasOverrides

  def ideation_fields_to_ui_schema fields, locale='en'
    ideation_form_layout(fields, locale) do |field|
      next nil unless field&.enabled
      override_method = "#{field.resource_type.underscore}_#{field.code}_to_ui_schema_field"
      if field.code && self.respond_to?(override_method, true)
        send(override_method, field, locale)
      else
        send("#{field.input_type}_to_ui_schema_field", field, locale)
      end
    end
  end

  def ideation_form_layout fields, locale='en'
    {
      type: 'Categorization',
      options: {
        formId: 'idea-form',
        inputTerm: 'idea',
      },
      elements: [
        {
          type: 'Category',
          label: I18n.t("What's your idea?", locale: locale),
          elements: [
            yield(fields.find{|f| f.code == 'title'}),
            yield(fields.find{|f| f.code == 'body'}),
          ].compact
        },
        {
          type: 'Category',
          label: I18n.t("Details", locale: locale),
          elements: [
            yield(fields.find{|f| f.code == 'topic_ids'}),
            yield(fields.find{|f| f.code == 'location'}),
          ].compact
        },
      ]
    }
  end

  private

  def custom_form_title_to_json_schema_field field, locale
    {
      type: 'object',
      minProperties: 1,
      description: handle_description(field, locale),
      properties: AppConfiguration.instance.settings('core','locales').map do |locale|
        [
          locale,
          {
            type: 'string',
            minLength: 10,
            maxLength: 80,
          }
        ]
      end.to_h
    }
  end

  def custom_form_title_to_ui_schema_field field, locale
    {
      type: 'VerticalLayout',
      render: 'multiloc',
      label: handle_title(field, locale),
      elements: AppConfiguration.instance.settings('core','locales').map do |locale|
        {
          type: 'Control',
          locale: locale,
          scope: "#/properties/#{field.key}/properties/#{locale}",
        }
      end
    }
  end

  def custom_form_body_to_json_schema_field field, locale
    {
      type: 'object',
      minProperties: 1,
      description: handle_description(field, locale),
      properties: AppConfiguration.instance.settings('core','locales').map do |locale|
        [
          locale,
          {
            type: 'string',
            minLength: 40,
          }
        ]
      end.to_h
    }
  end

  def custom_form_body_to_ui_schema_field field, locale
    {
      type: 'VerticalLayout',
      render: 'multiloc',
      label: handle_title(field, locale),
      elements: AppConfiguration.instance.settings('core','locales').map do |locale|
        {
          type: 'Control',
          render: 'WYSIWYG',
          locale: locale,
          scope: "#/properties/#{field.key}/properties/#{locale}",
        }
      end
    }
  end

  def custom_form_topic_ids_to_ui_schema_field field, locale
    topics = field.resource.project.topics
    {
      type: 'Control',
      label: handle_title(field, locale),
      scope: "#/properties/#{field.key}",
      options: topics.map{|t| {id: t.id, attributes: {title_multiloc: t.title_multiloc}}}
    }
  end

  def custom_form_location_to_ui_schema_field field, locale
    {
      type: 'Control',
      label: handle_title(field, locale),
      scope: "#/properties/#{field.key}",
    }
  end
end
