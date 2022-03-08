module JsonFormsIdeasOverrides

  def custom_form_to_ui_schema fields, locale='en'
    {
      type: 'Categorization',
      options: {
        formId: 'idea-form',
        inputTerm: 'idea',
      },
      elements: drop_empty_categories([
        {
          type: 'Category',
          label: I18n.t("What's your idea?", locale: locale),
          elements: [
            yield(fields.find{|f| f.code == 'title_multiloc'}),
            yield(fields.find{|f| f.code == 'body_multiloc'}),
          ].compact
        },
        {
          type: 'Category',
          label: I18n.t("Details", locale: locale),
          elements: [
            yield(fields.find{|f| f.code == 'proposed_budget'}),
            yield(fields.find{|f| f.code == 'topic_ids'}),
            yield(fields.find{|f| f.code == 'location'}),
          ].compact
        },
        {
          type: 'Category',
          label: I18n.t("Images and Attachments", locale: locale),
          elements: [
            yield(fields.find{|f| f.code == 'idea_images_attributes'}),
            yield(fields.find{|f| f.code == 'idea_files_attributes'}),
          ].compact
        },
        {
          type: 'Category',
          label: I18n.t("Extra", locale: locale),
          elements: fields.reject(&:built_in?).map{|f| yield f}
        }
      ].compact)
    }
  end

  private

  def drop_empty_categories categories
    categories.reject do |category|
      category[:elements].empty?
    end
  end

  def custom_form_title_multiloc_to_json_schema_field field, locale
    {
      type: 'object',
      minProperties: 1,
      properties: AppConfiguration.instance.settings('core','locales').map do |locale|
        [
          locale,
          {
            type: 'string',
            minLength: 10,
            maxLength: 80
          }
        ]
      end.to_h
    }
  end

  def custom_form_title_multiloc_to_ui_schema_field field, locale
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core','locales').map do |locale|
        {
          type: 'Control',
          scope: "#/properties/#{field.key}/properties/#{locale}",
          options: { locale: locale, trim_on_blur: true },
          label: handle_title(field, locale),
          description: handle_description(field, locale),
        }
      end
    }
  end

  def custom_form_body_multiloc_to_json_schema_field field, locale
    {
      type: 'object',
      minProperties: 1,
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

  def custom_form_body_multiloc_to_ui_schema_field field, locale
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core','locales').map do |locale|
        {
          type: 'Control',
          locale: locale,
          scope: "#/properties/#{field.key}/properties/#{locale}",
          options: { locale: locale, render: 'WYSIWYG' },
          label: handle_title(field, locale),
          description: handle_description(field, locale),
        }
      end
    }
  end

  def custom_form_topic_ids_to_ui_schema_field field, locale
    topics = field.resource.project.allowed_input_topics
    {
      type: 'Control',
      label: handle_title(field, locale),
      scope: "#/properties/#{field.key}",
      options: {available_topics: topics.map{|t| {id: t.id, attributes: {title_multiloc: t.title_multiloc}}}}
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
