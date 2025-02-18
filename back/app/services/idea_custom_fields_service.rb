# frozen_string_literal: true

class IdeaCustomFieldsService
  def initialize(custom_form)
    @custom_form = custom_form
    @participation_method = custom_form.participation_context.pmethod
  end

  def all_fields
    if @custom_form.custom_field_ids.empty?
      @participation_method.default_fields @custom_form
    else
      @custom_form.custom_fields.includes(
        :map_config,
        options: [:image]
      )
    end
  end

  def xlsx_exportable_fields
    all_fields.filter(&:supports_xlsx_export?)
  end

  def geojson_supported_fields
    all_fields.filter(&:supports_geojson?)
  end

  def visible_fields
    enabled_fields
  end

  def submittable_fields
    unsubmittable_input_types = %w[page section]
    enabled_fields.reject { |field| unsubmittable_input_types.include? field.input_type }
  end

  def submittable_fields_with_other_options
    insert_other_option_text_fields(submittable_fields)
  end

  # Used in the printable PDF export
  def printable_fields
    ignore_field_types = %w[section page date files image_files point file_upload shapefile_upload topic_ids cosponsor_ids ranking matrix_linear_scale]
    fields = enabled_fields.reject { |field| ignore_field_types.include? field.input_type }
    insert_other_option_text_fields(fields)
  end

  def importable_fields
    ignore_field_types = %w[page section date files image_files file_upload shapefile_upload point line polygon cosponsor_ids ranking matrix_linear_scale]
    enabled_fields_with_other_options.reject { |field| ignore_field_types.include? field.input_type }
  end

  def enabled_fields
    all_fields.select(&:enabled?)
  end

  def enabled_fields_with_other_options
    insert_other_option_text_fields(enabled_fields)
  end

  def enabled_public_fields
    enabled_fields.select { |field| field.answer_visible_to == CustomField::VISIBLE_TO_PUBLIC }
  end

  def extra_visible_fields
    visible_fields.reject(&:built_in?)
  end

  def validate_constraints_against_updates(field, field_params)
    constraints = @participation_method.constraints[field.code&.to_sym]
    return unless constraints

    # Convert ActionController::Parameters to a hash before making comparisons, as equality
    # between ActionController::Parameters and Hash has been deprecated and will always
    # return false.
    field_params = field_params.to_h if field_params.is_a?(ActionController::Parameters)

    constraints[:locks]&.each do |attribute, value|
      if value == true && field_params[attribute] != field[attribute] && !page1_title?(field, attribute)
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
      if value == true && field[attribute] != default_field[attribute] && !page1_title?(field, attribute)
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

    first_field_type = 'page'
    if fields[0][:input_type] != first_field_type
      error = { error: "First field must be of type '#{first_field_type}'" }
      errors['0'] = { structure: [error] }
    end
  end

  def duplicate_all_fields
    fields = all_fields
    logic_id_map = {}
    copied_fields = fields.map do |field|
      # Duplicate fields to return with a new id
      copied_field = field.dup
      copied_field.id = SecureRandom.uuid
      logic_id_map[field.id] = copied_field.id

      # Duplicate options to return them with a new id and a temp_id to enable logic copying
      copied_options = field.options.map do |option|
        copied_option = option.dup
        copied_option.id = SecureRandom.uuid
        copied_option.temp_id = "TEMP-ID-#{SecureRandom.uuid}"
        logic_id_map[option.id] = copied_option.temp_id
        copied_option
      end
      copied_field.options = copied_options

      # Duplicate statements
      copied_field.matrix_statements = field.matrix_statements.map do |statement|
        copied_statement = statement.dup
        copied_statement.id = SecureRandom.uuid
        copied_statement
      end

      # Duplicate and persist map config for custom_fields that can have an associated map_config
      if CustomField::MAP_CONFIG_INPUT_TYPES.include?(copied_field.input_type) && field.map_config
        original_map_config = CustomMaps::MapConfig.find(field.map_config.id)
        new_map_config = original_map_config.dup
        new_map_config.mappable = nil
        if new_map_config.save
          new_map_config_layers = original_map_config.layers.map(&:dup)
          new_map_config_layers.each do |layer|
            layer.map_config = new_map_config
            layer.save!
          end
          copied_field.map_config = new_map_config
        end
      end

      copied_field
    end

    # Update the logic
    copied_fields.map do |field|
      if field.logic['rules']
        field.logic['rules'].map! do |rule|
          rule['if'] = logic_id_map[rule['if']]
          rule['goto_page_id'] = logic_id_map[rule['goto_page_id']]
          rule
        end
      elsif field.logic['next_page_id']
        field.logic['next_page_id'] = logic_id_map[field.logic['next_page_id']]
      end
      field
    end
  end

  private

  def insert_other_option_text_fields(fields)
    all_fields = []
    fields.each do |field|
      all_fields << field
      all_fields << field.other_option_text_field if field.other_option_text_field
    end
    all_fields
  end

  # Check required as it doesn't matter what is saved in title for page 1
  # Constraints required for the front-end but response will always return input specific method
  def page1_title?(field, attribute)
    field.code == 'ideation_page1' && attribute == :title_multiloc
  end

  attr_reader :custom_form, :participation_method
end
