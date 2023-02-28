# frozen_string_literal: true

class IdeaCustomFieldsService
  def initialize(custom_form)
    @custom_form = custom_form
    @participation_method = Factory.instance.participation_method_for custom_form.participation_context
  end

  def all_fields
    if @custom_form.custom_field_ids.empty?
      @participation_method.default_fields @custom_form
    else
      @custom_form.custom_fields
    end
  end

  def reportable_fields
    # idea_images_attributes is not supported by XlsxService.
    # Page and section fields do not capture data, so they are excluded.
    all_fields.select do |field|
      field.code != 'idea_images_attributes' && field.input_type != 'page' && field.input_type != 'section'
    end
  end

  def visible_fields
    enabled_fields
  end

  def submittable_fields
    unsubbmittable_input_types = %w[page section]
    enabled_fields.reject { |field| unsubbmittable_input_types.include? field.input_type }
  end

  def enabled_fields
    all_fields.select(&:enabled?)
  end

  def enabled_public_fields
    enabled_fields.select { |field| field.answer_visible_to == CustomField::VISIBLE_TO_PUBLIC }
  end

  def extra_visible_fields
    visible_fields.reject(&:built_in?)
  end

  def allowed_extra_field_keys
    fields_with_simple_keys = []
    fields_with_array_keys = {}
    submittable_fields.reject(&:built_in?).each do |field|
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
    constraints = @participation_method.constraints[field.code&.to_sym]
    return unless constraints

    constraints[:locks]&.each do |attribute, value|
      if value == true && field_params[attribute] != field[attribute] && !section1_title?(field, attribute)
        field.errors.add :constraints, "Cannot change #{attribute}. It is locked."
      end
    end
  end

  def validate_constraints_against_defaults(field)
    constraints = @participation_method.constraints[field.code&.to_sym]
    return unless constraints

    default_fields = @participation_method.default_fields @custom_form
    default_field = default_fields.find { |f| f.code == field.code }

    constraints[:locks]&.each do |attribute, value|
      if value == true && field[attribute] != default_field[attribute] && !section1_title?(field, attribute)
        field.errors.add :constraints, "Cannot change #{attribute} from default value. It is locked."
      end
    end
  end

  # The following params should not be editable after they have been created
  def remove_ignored_update_params(field_params)
    field_params.except(:code, :input_type)
  end

  def check_form_structure(fields, errors)
    return if fields.empty?

    can_have_type = @participation_method.form_structure_element
    cannot_have_type = can_have_type == 'section' ? 'page' : 'section'
    if fields[0][:input_type] != can_have_type
      error = { error: "First field must be of type '#{can_have_type}'" }
      errors['0'] = { structure: [error] }
    end
    fields.each_with_index do |field, index|
      next unless field[:input_type] == cannot_have_type

      error = { error: "Method '#{participation_method}' cannot contain fields with an input_type of '#{cannot_have_type}'" }
      if errors[index.to_s] && errors[index.to_s][:structure]
        errors[index.to_s][:structure] << error
      else
        errors[index.to_s] = { structure: [error] }
      end
    end
  end

  private

  # Check required as it doesn't matter what is saved in title for section 1
  # Constraints required for the front-end but response will always return input specific method
  def section1_title?(field, attribute)
    field.code == 'ideation_section1' && attribute == :title_multiloc
  end

  attr_reader :custom_form, :participation_method
end
