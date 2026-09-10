# frozen_string_literal: true

# Transitional adapter: stages a custom_field_values-style hash onto the
# custom_field_answers association (persisted by the record's save). To be
# deleted once the API and the importers speak answers directly.
class CustomFieldValuesTransitionService
  # nil values count as absent answers.
  def assign(record, values)
    values = (values || {}).as_json.compact
    answers = record.custom_field_answers.reject(&:marked_for_destruction?).index_by(&:key)
    field_ids = field_ids_by_key(record, values.keys)

    (answers.keys - values.keys).each { |key| answers[key].mark_for_destruction }
    values.each do |key, value|
      if (answer = answers[key])
        answer.assign_attributes(value: value, custom_field_id: field_ids[key])
      else
        record.custom_field_answers.build(key: key, value: value, custom_field_id: field_ids[key])
      end
    end
  end

  private

  def field_ids_by_key(record, keys)
    return {} if keys.empty?

    field_ids = field_ids_for(context_fields(record), keys.index_with(&:itself))
    field_ids.merge!(derived_field_ids(record, keys - field_ids.keys))
    field_ids
  end

  # Derived keys resolve to the field of their base key: _other/_follow_up
  # companions in the same context, u_ copies of registration field answers
  # (and their companions) against the registration fields.
  def derived_field_ids(record, keys)
    prefix = UserFieldsInFormService.prefix
    context_base_keys = {}
    registration_base_keys = {}
    keys.each do |key|
      base_key = key.delete_suffix('_other').delete_suffix('_follow_up')
      if record.is_a?(Idea) && base_key.start_with?(prefix)
        registration_base_keys[key] = base_key.delete_prefix(prefix)
      elsif base_key != key
        context_base_keys[key] = base_key
      end
    end

    field_ids_for(context_fields(record), context_base_keys)
      .merge(field_ids_for(CustomField.registration, registration_base_keys))
  end

  def field_ids_for(fields, base_keys_by_key)
    return {} if base_keys_by_key.empty?

    ids_by_base_key = fields.where(key: base_keys_by_key.values.uniq).pluck(:key, :id).to_h
    base_keys_by_key.filter_map { |key, base_key| [key, ids_by_base_key[base_key]] if ids_by_base_key[base_key] }.to_h
  end

  def context_fields(record)
    case record
    when User then CustomField.registration
    when Idea then record.custom_form&.custom_fields || CustomField.none
    end
  end
end
