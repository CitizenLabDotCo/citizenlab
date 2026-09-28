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

  def delete_field_answers(field)
    case field.resource_type
    when 'User'
      delete_answers_for_keys(User.all, keys_with_companions(field.key))
      delete_answers_for_keys(Idea.all, keys_with_companions(UserFieldsInFormService.prefix_key(field.key)))
    when 'CustomForm'
      delete_answers_for_keys(form_inputs(field.resource), keys_with_companions(field.key))
    end
  end

  def delete_custom_field_option_values(option_key, field)
    return if field.resource_type != 'User'

    answers = CustomFieldAnswer.where(answerable_type: 'User', key: field.key)
    if field.supports_multiple_selection?
      # When option is the only selection
      answers.where('value = :value::jsonb', value: [option_key].to_json).delete_all
      # When option was selected amongst other values
      answers.where('value ? :value', value: option_key).update_all("value = value - '#{option_key}'")
    else
      # When single select
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

  # Drops values for registration fields this platform does not have. An identity
  # provider can return such a key, and once stored it makes the profile form refuse
  # every later save.
  # @param [Hash] custom_field_values with string or symbol keys
  # @return [Hash<String, _>]
  def self.remove_unknown_registration_custom_fields(custom_field_values)
    values = custom_field_values.to_h.stringify_keys
    values.slice(*CustomField.registration.where(key: values.keys).pluck(:key))
  end

  # Fallback to another locale title if current locale is missing
  def handle_title(field, locale)
    I18n.with_locale(locale) do
      @multiloc_service.t(field.title_multiloc)
    end
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

  def delete_answers_for_keys(scope, keys)
    CustomFieldAnswer.where(answerable: scope, key: keys).delete_all
  end
end
