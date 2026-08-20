# frozen_string_literal: true

class CustomFieldService
  def initialize
    @multiloc_service = MultilocService.new app_configuration: AppConfiguration.instance
  end

  def generate_key(title, other_option: false)
    other_option ? 'other' : keyify(title)
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

  def delete_custom_field_values(field)
    case field.resource_type
    when 'User'
      delete_keys_from_values(User.all, keys_with_companions(field.key))
      delete_keys_from_values(Idea.all, keys_with_companions(UserFieldsInFormService.prefix_key(field.key)))
    when 'CustomForm'
      delete_keys_from_values(form_inputs(field.resource), keys_with_companions(field.key))
    end
  end

  def delete_custom_field_option_values(option_key, field)
    return if field.resource_type != 'User'

    answers = CustomFieldAnswer.where(answerable_type: 'User', key: field.key)
    if field.supports_multiple_selection?
      # When option is the only selection
      User
        .where("custom_field_values->>'#{field.key}' = ?", [option_key].to_json)
        .update_all("custom_field_values = custom_field_values - '#{field.key}'")
      answers.where('value = :value::jsonb', value: [option_key].to_json).delete_all
      # When option was selected amongst other values
      User
        .where("(custom_field_values->>'#{field.key}')::jsonb ? :value", value: option_key)
        .update_all("custom_field_values = jsonb_set(custom_field_values, '{#{field.key}}', (custom_field_values->'#{field.key}') - '#{option_key}')")
      answers.where('value ? :value', value: option_key).update_all("value = value - '#{option_key}'")
    else
      # When single select
      User
        .where("custom_field_values->>'#{field.key}' = ?", option_key)
        .update_all("custom_field_values = custom_field_values - '#{field.key}'")
      answers.where('value = :value::jsonb', value: option_key.to_json).delete_all
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

      if field.supports_other_option?
        visible_keys << "#{field.key}_other"
      end

      if field.supports_follow_up?
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

  private

  def form_inputs(custom_form)
    context = custom_form.participation_context
    if context.is_a?(Phase)
      Idea.where(creation_phase_id: context.id)
    else
      Idea.where(project_id: context.id)
    end
  end

  def keys_with_companions(key)
    [key, "#{key}_other", "#{key}_follow_up"]
  end

  def delete_keys_from_values(scope, keys)
    keys_sql = keys.map { |key| "'#{key}'" }.join(', ')
    scope
      .where("custom_field_values ?| array[#{keys_sql}]")
      .update_all("custom_field_values = custom_field_values - array[#{keys_sql}]::text[]")
    CustomFieldAnswer.where(answerable: scope, key: keys).delete_all
  end

  # *** text ***

  def text_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** number ***

  def number_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
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

  # *** select ***

  def select_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** multiselect ***

  def multiselect_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** checkbox ***

  def checkbox_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** date ***

  def date_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # Methods here are not really used to render the fields on the front-end, only description hidden and required are used

  # *** html ***

  def html_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** text_multiloc ***

  def text_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** multiline_text_multiloc ***

  def multiline_text_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** html_multiloc ***

  def html_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** point ***

  def point_to_ui_schema_field(_field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden'
    end
  end

  # *** line ***

  def line_to_ui_schema_field(_field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden'
    end
  end

  # *** polygon ***

  def polygon_to_ui_schema_field(_field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden'
    end
  end

  # *** files ***

  def files_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  # *** image files ***

  def image_files_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end
end
