# frozen_string_literal: true

# Projects the custom_field_values hash of an idea or user onto
# custom_field_answers rows: one row per top-level key. Keys without a matching
# custom field produce rows without custom_field_id.
class CustomFieldAnswerService
  # Idempotent reconciliation; nil values count as absent answers.
  def sync!(record)
    custom_field_values = normalized_custom_field_values(record).compact
    answers = record.custom_field_answers.reload.index_by(&:key)
    field_ids = field_ids_by_key(record, custom_field_values.keys)

    stale_keys = answers.keys - custom_field_values.keys
    record.custom_field_answers.where(key: stale_keys).delete_all if stale_keys.any?

    custom_field_values.each do |key, value|
      answer = answers[key]
      if !answer
        record.custom_field_answers.create!(key: key, value: value, custom_field_id: field_ids[key])
      elsif answer.value != value || answer.custom_field_id != field_ids[key]
        answer.update!(value: value, custom_field_id: field_ids[key])
      end
    end

    record.custom_field_answers.reset
  end

  private

  # The hash exactly as jsonb stores it: string keys, JSON scalars.
  def normalized_custom_field_values(record)
    type = record.class.type_for_attribute('custom_field_values')
    type.deserialize(type.serialize(record.custom_field_values)) || {}
  end

  def field_ids_by_key(record, keys)
    return {} if keys.empty?

    field_ids = context_fields(record).where(key: keys).pluck(:key, :id).to_h
    field_ids.merge!(user_field_ids_by_prefixed_key(keys - field_ids.keys)) if record.is_a?(Idea)
    field_ids
  end

  # u_ keys on ideas are copies of registration field answers.
  def user_field_ids_by_prefixed_key(keys)
    prefix = UserFieldsInFormService.prefix
    user_keys = keys.filter_map { |key| key.delete_prefix(prefix) if key.start_with?(prefix) }
    return {} if user_keys.empty?

    CustomField.registration.where(key: user_keys).pluck(:key, :id).to_h
      .transform_keys { |key| "#{prefix}#{key}" }
  end

  def context_fields(record)
    case record
    when User then CustomField.registration
    when Idea then record.custom_form&.custom_fields || CustomField.none
    end
  end
end
