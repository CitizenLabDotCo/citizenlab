# frozen_string_literal: true

# Transitional adapter: stages a custom_field_values-style hash onto the
# custom_field_answers association (persisted by the record's save). To be
# deleted once the API and the importers speak answers directly.
class CustomFieldValuesTransitionService
  # nil values count as absent answers.
  def assign(record, values)
    values = (values || {}).as_json.compact
    answers = record.custom_field_answers.reject(&:marked_for_destruction?).index_by(&:key)
    fields = fields_by_key(record, values.keys)

    (answers.keys - values.keys).each { |key| answers[key].mark_for_destruction }
    values.each do |key, value|
      field = fields[key]
      value = field.input_type_strategy.normalize_value(value) if field
      if (answer = answers[key])
        answer.assign_attributes(value: value, custom_field: field)
      else
        record.custom_field_answers.build(key: key, value: value, custom_field: field)
      end
    end
  end

  def custom_field_values(record)
    return {} if !record

    record.custom_field_answers.reject(&:marked_for_destruction?).to_h { [it.key, it.value] }
  end

  private

  def fields_by_key(record, keys)
    return {} if keys.empty?

    fields = fields_for(context_fields(record), keys.index_with(&:itself))
    fields.merge!(derived_fields(record, keys - fields.keys))
    fields
  end

  # Derived keys resolve to the field of their base key: _other/_follow_up
  # companions in the same context, u_ copies of registration field answers
  # (and their companions) against the registration fields.
  def derived_fields(record, keys)
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

    fields_for(context_fields(record), context_base_keys)
      .merge(fields_for(CustomField.registration, registration_base_keys))
  end

  def fields_for(fields, base_keys_by_key)
    return {} if base_keys_by_key.empty?

    by_base_key = fields.where(key: base_keys_by_key.values.uniq).index_by(&:key)
    base_keys_by_key.filter_map { |key, base_key| [key, by_base_key[base_key]] if by_base_key[base_key] }.to_h
  end

  def context_fields(record)
    case record
    when User then CustomField.registration
    when Idea then record.custom_form&.custom_fields || CustomField.none
    end
  end
end
