# frozen_string_literal: true

class CustomFieldService
  include CustomFieldUserOverrides

  def initialize
    @multiloc_service = MultilocService.new app_configuration: AppConfiguration.instance
  end

  # To allow schema validation whilst ignoring 'required' requirements by setting all required attributes to false
  def fields_to_json_schema_ignore_required(fields)
    optional_fields = fields.map do |field|
      field[:required] = false
      field
    end
    fields_to_json_schema(optional_fields)
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

  # NOTE: Needs refactor. This is called by idea serializer so will have an n+1 issue
  def self.remove_not_visible_fields(idea, current_user)
    return idea.custom_field_values if idea.draft?

    # If super admin, we return all custom fields.
    # This is mostly for debugging purposes, and to allow checking
    # this behavior in the e2e tests.
    return idea.custom_field_values if current_user&.super_admin?

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

  # Making pages a different data model would avoid
  # having to do this.
  def pages(fields)
    fields.chunk_while { |_, field| !field.page? }
  end
end
