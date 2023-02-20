# frozen_string_literal: true

class TemplateService
  def initialize
    @template_refs = {}
  end

  protected

  def lookup_ref(id, model_name)
    return nil unless id

    if model_name.is_a?(Array)
      model_name.each do |one_model_name|
        return @template_refs.dig(one_model_name, id) if @template_refs.dig(one_model_name, id)
      end
      nil
    else
      @template_refs[model_name][id]
    end
  end

  def store_ref(yml_object, id, model_name)
    @template_refs[model_name] ||= {}
    @template_refs[model_name][id] = yml_object
  end

  def filter_custom_field_values(custom_field_values, custom_fields)
    # Templates do not support ID references.

    supported_fields = custom_fields.select do |field|
      %w[file_upload].exclude? field.input_type
    end
    custom_field_values.slice(*supported_fields.map(&:key))
  end

  def current_text_images(parent)
    parent_to_json = parent.to_json

    parent.text_images.select { |ti| parent_to_json.include?(ti.text_reference) }
  end
end
