# frozen_string_literal: true

class IdeaCustomFieldsService
  def initialize(custom_form)
    @custom_form = custom_form
    @participation_method = Factory.instance.participation_method_for custom_form.participation_context
  end

  def all_fields
    if @custom_form.custom_field_ids.empty?
      participation_method.default_fields custom_form
    else
      @custom_form.custom_fields
    end
  end

  def configurable_fields
    all_fields
    # disallowed_fields = %w[author_id budget]
    # all_fields.reject do |field|
    #   disallowed_fields.include? field.code
    # end
  end

  def reportable_fields
    enabled_fields.reject(&:built_in?)
  end

  def visible_fields
    enabled_fields
  end

  def enabled_fields
    all_fields.select(&:enabled?)
  end

  def extra_visible_fields
    visible_fields.reject(&:built_in?)
  end

  def allowed_extra_field_keys
    fields_with_simple_keys = []
    fields_with_array_keys = {}
    extra_visible_fields.each do |field|
      case field.input_type
      when 'multiselect'
        fields_with_array_keys[field.key.to_sym] = []
      when 'file_upload'
        fields_with_array_keys[field.key.to_sym] = %i[content name]
      else
        fields_with_simple_keys << field.key.to_sym
      end
    end
    [
      *fields_with_simple_keys,
      fields_with_array_keys
    ]
  end

  private

  attr_reader :custom_form, :participation_method
end
