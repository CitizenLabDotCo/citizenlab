module JsonFormsIdeasOverrides
  def custom_form_to_ui_schema(fields, locale = 'en', &block)
    project = fields.first.resource.project
    input_term = project.process_type == 'continuous' ? project.input_term : TimelineService.new.current_phase(project)&.input_term || 'idea'
    {
      type: 'Categorization',
      options: {
        formId: 'idea-form',
        inputTerm: input_term
      },
      elements: drop_empty_categories([
        {
          type: 'Category',
          label: I18n.t("custom_forms.categories.main_content.#{input_term}.title", locale: locale),
          options: { id: 'mainContent' },
          elements: [
            yield(fields.find { |f| f.code == 'title_multiloc' }),
            yield(fields.find { |f| f.code == 'author_id' }),
            yield(fields.find { |f| f.code == 'body_multiloc' })
          ].compact
        },
        {
          type: 'Category',
          options: { id: 'details' },
          label: I18n.t('custom_forms.categories.details.title', locale: locale),
          elements: [
            yield(fields.find { |f| f.code == 'proposed_budget' }),
            yield(fields.find { |f| f.code == 'budget' }),
            yield(fields.find { |f| f.code == 'topic_ids' }),
            yield(fields.find { |f| f.code == 'location_description' })
          ].compact
        },
        {
          type: 'Category',
          label: I18n.t('custom_forms.categories.attachements.title', locale: locale),
          options: { id: 'attachments' },
          elements: [
            yield(fields.find { |f| f.code == 'idea_images_attributes' }),
            yield(fields.find { |f| f.code == 'idea_files_attributes' })
          ].compact
        },
        {
          type: 'Category',
          options: { id: 'extra' },
          label: I18n.t('custom_forms.categories.extra.title', locale: locale),
          elements: fields.reject(&:built_in?).map(&block)
        }
      ].compact)
    }
  end

  def custom_form_to_json_schema(fields, locale = 'en')
    {
      type: 'object',
      additionalProperties: false,
      properties: fields.select(&:built_in?).inject({}) do |memo, built_in_field|
        override_method = "#{built_in_field.resource_type.underscore}_#{built_in_field.code}_to_json_schema_field"
        memo[built_in_field.key] =
          if built_in_field.code && respond_to?(override_method, true)
            send(override_method, built_in_field, locale)
          else
            send("#{built_in_field.input_type}_to_json_schema_field", built_in_field, locale)
          end
        memo.tap do |properties|
          properties[:custom_field_values] = {
            type: 'object',
            additionalProperties: false,
            properties: fields.reject(&:built_in?).each_with_object({}) do |field, accu|
              override_method = "#{field.resource_type.underscore}_#{field.code}_to_json_schema_field"
              accu[field.key] =
                if field.code && respond_to?(override_method, true)
                  send(override_method, field, locale)
                else
                  send("#{field.input_type}_to_json_schema_field", field, locale)
                end
            end
          }
        end
      end
    }.tap do |output|
      required = fields.select(&:enabled).select(&:required).map(&:key)
      output[:required] = required unless required.empty?
    end
  end

  private

  def drop_empty_categories(categories)
    categories.reject do |category|
      category[:elements].empty?
    end
  end

  def custom_form_title_multiloc_to_json_schema_field(_field, _locale)
    {
      type: 'object',
      minProperties: 1,
      properties: AppConfiguration.instance.settings('core', 'locales').index_with do |_locale|
        {
            type: 'string',
            minLength: 10,
            maxLength: 80
          }
      end
    }
  end

  def custom_form_title_multiloc_to_ui_schema_field(field, _locale, previous_scope)
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core', 'locales').map do |locale|
        {
          type: 'Control',
          scope: "#{previous_scope || '#/properties/'}#{field.key}/properties/#{locale}",
          options: { locale: locale, trim_on_blur: true, description: handle_description(field, locale) },
          label: handle_title(field, locale)
        }
      end
    }
  end

  def custom_form_body_multiloc_to_json_schema_field(_field, _locale)
    {
      type: 'object',
      minProperties: 1,
      properties: AppConfiguration.instance.settings('core', 'locales').index_with do |_locale|
        {
            type: 'string',
            minLength: 40
          }
      end
    }
  end

  def custom_form_body_multiloc_to_ui_schema_field(field, _locale, previous_scope)
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core', 'locales').map do |locale|
        {
          type: 'Control',
          locale: locale,
          scope: "#{previous_scope || '#/properties/'}#{field.key}/properties/#{locale}",
          options: { locale: locale, render: 'WYSIWYG', description: handle_description(field, locale) },
          label: handle_title(field, locale)
        }
      end
    }
  end

  def custom_form_topic_ids_to_json_schema_field(field, locale)
    topics = field.resource.project&.allowed_input_topics
    {
      type: 'array',
      uniqueItems: true,
      minItems: field.enabled && field.required ? 1 : 0,
      items: {
          type: 'string'
      }.tap do |items|
        unless topics.empty?
          items[:oneOf] = topics.map do |topic|
            {
              const: topic.id,
              title: handle_title(topic, locale)
            }
          end
        end
      end
    }
  end

  def custom_form_location_point_geojson_to_ui_schema_field(_field, _locale)
    {}
  end

  # Some custom fields have to exist but are only shown to admins, like the author picker when the feature is enabled and the budget fields in pb contexts. (not to confuse with the proposed_budget visible to everyone, when enabled, whatever the feature flag, which is weird, but seems to be the expected behaviour).
  # A good solution would be to add this info to the CustomField model. Like adminOnly and a feature name to enable or disable automatically, but this would have to be done right to build the foundations of a permission system informing who can modify the field, access the data filled in through the field, or fill the field in themselves, and that was out of scope.
  def custom_form_allowed_fields(configuration, fields, current_user)
    fields.filter do |f|
      (f.code != 'author_id' && f.code != 'budget') || (
        f.code == 'author_id' &&
        configuration.feature_activated?('idea_author_change') &&
        !current_user.nil? &&
        UserRoleService.new.can_moderate_project?(f.resource.project, current_user)
      ) || (
        (f.code == 'budget' &&
        configuration.feature_activated?('participatory_budgeting') &&
        !current_user.nil? &&
        UserRoleService.new.can_moderate_project?(f.resource.project, current_user) && (
          f.resource.project&.process_type == 'continuous' &&
          f.resource.project&.participation_method == 'budgeting'
        )) || (
          f.resource.project&.process_type == 'timeline' &&
          f.resource.project&.phases&.any? { |p| p.participation_method == 'budgeting' }))
    end
  end
end
