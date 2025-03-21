class CustomFieldParamsService
  def custom_field_values_params(allowed_fields)
    fields_with_simple_keys = []
    fields_with_array_keys = {}
    allowed_fields.each do |field|
      field_keys = supported_keys_in_custom_field_values(field)
      if field_keys
        fields_with_array_keys[field.key.to_sym] = field_keys
      else
        fields_with_simple_keys << field.key.to_sym
      end
    end
    if fields_with_array_keys.empty?
      fields_with_simple_keys
    else
      fields_with_simple_keys + [fields_with_array_keys]
    end
  end

  def extract_custom_field_values_from_params!(params, fields)
    extra_field_values = fields.each_with_object({}) do |field, accu|
      next if field.built_in?

      given_value = params.delete field.key
      next if !given_value || !field.enabled?

      accu[field.key] = given_value
    end

    reject_other_text_values(extra_field_values)
  end

  def mark_custom_field_values_to_clear!(current_custom_field_values, custom_field_values_params)
    # We need to explicitly mark which custom field values
    # should be cleared so we can distinguish those from
    # the custom field value updates cleared out by the
    # policy (which should stay like before instead of
    # being cleared out).
    return if current_custom_field_values.blank? || custom_field_values_params.blank?

    (current_custom_field_values.keys - (custom_field_values_params.keys || [])).each do |clear_key|
      custom_field_values_params[clear_key] = nil
    end
  end

  def updated_custom_field_values(current_custom_field_values, custom_field_values_params)
    current_custom_field_values.merge(custom_field_values_params || {})
  end

  private

  def supported_keys_in_custom_field_values(custom_field)
    case custom_field.input_type
    when 'multiselect', 'multiselect_image', 'ranking'
      [] # Array-like value
    when 'file_upload', 'shapefile_upload'
      %i[id content name]
    when 'html_multiloc', 'multiline_text_multiloc', 'text_multiloc'
      CL2_SUPPORTED_LOCALES
    when 'matrix_linear_scale'
      custom_field.matrix_statements.pluck(:key).map(&:to_sym)
    end
  end

  # Do not save any 'other' text values if the select field does not include 'other' as an option
  def reject_other_text_values(extra_field_values)
    extra_field_values.each_key do |key|
      if key.end_with? '_other'
        parent_field_key = key.delete_suffix '_other'
        parent_field_values = extra_field_values[parent_field_key].is_a?(Array) ? extra_field_values[parent_field_key] : [extra_field_values[parent_field_key]]
        if parent_field_values.exclude? 'other'
          extra_field_values.delete key
        end
      end
    end
  end
end
