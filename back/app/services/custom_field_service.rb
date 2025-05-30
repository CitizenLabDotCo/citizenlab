# frozen_string_literal: true

class CustomFieldService
  include CustomFieldUserOverrides

  def initialize
    @multiloc_service = MultilocService.new app_configuration: AppConfiguration.instance
  end

  def ui_and_json_multiloc_schemas(configuration, fields)
    json_schema_multiloc = fields_to_json_schema_multiloc(configuration, fields)
    ui_schema_multiloc = fields_to_ui_schema_multiloc(configuration, fields)

    { json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc }
  end

  # @param [AppConfiguration] configuration
  # @return [Hash{String => Object}]
  def fields_to_json_schema_multiloc(configuration, fields)
    configuration.settings('core', 'locales').index_with do |locale|
      fields_to_json_schema(fields, locale)
    end
  end

  def fields_to_json_schema(fields, locale = 'en')
    {
      type: 'object',
      additionalProperties: false,
      properties: fields.each_with_object({}) do |field, memo|
        override_method_code = "#{field.resource_type.underscore}_#{field.code}_to_json_schema_field"
        override_method_type = "#{field.resource_type.underscore}_#{field.input_type}_to_json_schema_field"
        memo[field.key] =
          if field.code && respond_to?(override_method_code, true)
            send(override_method_code, field, locale)
          elsif field.input_type && respond_to?(override_method_type, true)
            send(override_method_type, field, locale)
          else
            send(:"#{field.input_type}_to_json_schema_field", field, locale)
          end
      end
    }.tap do |output|
      required = fields.select(&:enabled?).select(&:required?).map(&:key)
      output[:required] = required unless required.empty?
    end
  end

  # To allow schema validation whilst ignoring 'required' requirements by setting all required attributes to false
  def fields_to_json_schema_ignore_required(fields)
    optional_fields = fields.map do |field|
      field[:required] = false
      field
    end
    fields_to_json_schema(optional_fields)
  end

  # @param [AppConfiguration] configuration
  # @return [Hash{String => Object}]
  def fields_to_ui_schema_multiloc(configuration, fields)
    configuration.settings('core', 'locales').index_with do |locale|
      fields_to_ui_schema(fields, locale)
    end
  end

  def fields_to_ui_schema(fields, locale = 'en')
    fields.each_with_object({}) do |field, memo|
      override_method = "#{field.resource_type.underscore}_#{field.code}_to_ui_schema_field"
      memo[field.key] =
        if field.code && respond_to?(override_method, true)
          send(override_method, field, locale)
        else
          send(:"#{field.input_type}_to_ui_schema_field", field, locale)
        end
    end.tap do |output|
      output['ui:order'] = fields.sort_by { |f| f.ordering || Float::INFINITY }.map(&:key)
    end
  end

  def generate_key(title, other_option: false)
    return 'other' if other_option == true

    keyify(title)
  end

  def keyify(str)
    key = str.parameterize.tr('-', '_').presence || '_'
    generate_token(key)
  end

  def generate_token(str)
    str.dup.concat('_', [*('a'..'z'), *('0'..'9')].sample(3).join)
  end

  # Removes all blank values from the values hash in place, except for `false` values,
  # and returns self.
  # @example
  #  compact_custom_field_values!({a: 1, b: '', c: false, d: nil})
  #  # => {a: 1, c: false}
  def compact_custom_field_values!(cf_values)
    cf_values.keep_if do |_key, value|
      value.present? || value == false
    end
  end

  # @param [Hash<String, _>] custom_field_values
  # @return [Hash<String, _>]
  def self.remove_hidden_custom_fields(custom_field_values)
    # The key to performance here is that the SQL request that gets 'all_hidden_keys' is always the same (it does not
    # depend on the parameters). As a consequence, if this method is called several times for processing a single
    # request, the result of the request is cached and the request is not repeated.
    all_hidden_keys = CustomField.hidden.pluck(:key)
    hidden_keys = all_hidden_keys & custom_field_values.keys
    custom_field_values.except(*hidden_keys)
  end

  # @param [Hash<String, _>] custom_field_values
  # @return [Hash<String, _>]
  # NOTE: this only works for users - custom forms can have the same key in multiple forms
  def self.remove_disabled_custom_fields(custom_field_values)
    all_disabled_keys = CustomField.disabled.pluck(:key)
    disabled_keys = all_disabled_keys & custom_field_values.keys
    custom_field_values.except(*disabled_keys)
  end

  # NOTE: Needs refactor. This is called by idea serializer so will have an n+1 issue
  def self.remove_not_visible_fields(idea, current_user)
    return idea.custom_field_values if idea.draft?

    fields = IdeaCustomFieldsService.new(idea.custom_form).enabled_public_fields
    if can_see_admin_answers?(idea, current_user)
      fields = IdeaCustomFieldsService.new(idea.custom_form).enabled_fields
    end

    visible_keys = []
    fields.each do |field|
      visible_keys << field.key

      if field.support_other_option?
        visible_keys << "#{field.key}_other"
      end

      if field.support_follow_up?
        visible_keys << "#{field.key}_follow_up"
      end
    end

    idea.custom_field_values.slice(*visible_keys)
  end

  def self.can_see_admin_answers?(idea, current_user)
    return false unless current_user

    idea.author_id == current_user.id || UserRoleService.new.can_moderate_project?(idea.project, current_user)
  end

  # Fallback to another locale title if current locale is missing
  def handle_title(field, locale)
    I18n.with_locale(locale) do
      @multiloc_service.t(field.title_multiloc)
    end
  end

  # Fallback to another locale description if current locale is missing
  def handle_description(field, locale)
    I18n.with_locale(locale) do
      @multiloc_service.t(field.description_multiloc)
    end
  end

  private

  def base_ui_schema_field(field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden' if field.hidden? || !field.enabled?
    end
  end

  # *** text ***

  def text_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def text_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** number ***

  def number_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def number_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'number'
    }
  end

  # *** multiline_text ***

  def multiline_text_to_ui_schema_field(field, locale)
    base = base_ui_schema_field(field, locale)
    if base[:'ui:widget']
      base
    else
      { 'ui:widget': 'textarea' }
    end
  end

  def multiline_text_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** select ***

  def select_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def select_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }.tap do |items|
      options = field.ordered_transformed_options

      unless options.empty?
        items[:enum] = options.map(&:key)
        items[:enumNames] = options.map { |o| handle_title(o, locale) }
      end
    end
  end

  # *** multiselect ***

  def multiselect_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def multiselect_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'array',
      uniqueItems: true,
      minItems: field.enabled? && field.required? ? 1 : 0,
      items: {
        type: 'string'
      }.tap do |items|
        options = field.ordered_options

        unless options.empty?
          items[:enum] = options.map(&:key)
          items[:enumNames] = options.map { |o| handle_title(o, locale) }
        end
      end
    }
  end

  # *** checkbox ***

  def checkbox_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def checkbox_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'boolean'
    }
  end

  # *** date ***

  def date_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def date_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string',
      format: 'date'
    }
  end

  # Methods here are not really used to render the fields on the front-end, only description hidden and required are used

  # *** html ***

  def html_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def html_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** text_multiloc ***

  def text_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def text_multiloc_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** multiline_text_multiloc ***

  def multiline_text_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def multiline_text_multiloc_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** html_multiloc ***

  def html_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def html_multiloc_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** point ***

  def point_to_ui_schema_field(_field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden'
    end
  end

  def point_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** line ***

  def line_to_ui_schema_field(_field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden'
    end
  end

  def line_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** polygon ***

  def polygon_to_ui_schema_field(_field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden'
    end
  end

  def polygon_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** files ***

  def files_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def files_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'array',
      items: {
        type: 'string',
        format: 'data-url'
      }
    }
  end

  # *** image files ***

  def image_files_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def image_files_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end
end
