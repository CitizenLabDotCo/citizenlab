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
    if fields_with_array_keys.empty?
      fields_with_simple_keys
    else
      fields_with_simple_keys + [fields_with_array_keys]
    end
  end

  def validate_constraints_against_updates(field, field_params)
    field_code = field.code ? field.code.to_sym : nil
    constraints = @participation_method.constraints[field_code]
    return unless constraints

    constraints[:locks]&.each do |attribute, value|
      if value == true && field_params[attribute] != field[attribute] && !section1_title?(field, attribute)
        field.errors.add :constraints, "Cannot change #{attribute}. It is locked."
      end
    end
  end

  def validate_constraints_against_defaults(field)
    field_code = field.code ? field.code.to_sym : nil
    constraints = @participation_method.constraints[field_code]
    return unless constraints

    default_fields = @participation_method.default_fields field.resource.participation_context
    default_field = default_fields.find { |f| f.code == field.code }

    constraints[:locks]&.each do |attribute, value|
      if value == true && field[attribute] != default_field[attribute] && !section1_title?(field, attribute)
        field.errors.add :constraints, "Cannot change #{attribute} from default value. It is locked."
      end
    end
  end

  private

  def section1_title?(field, attribute)
    field.code == 'ideation_section1' && attribute == :title_multiloc
  end

  attr_reader :custom_form, :participation_method
end
