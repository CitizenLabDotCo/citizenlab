# frozen_string_literal: true

class IdeaCustomFieldsService
  def initialize(custom_form)
    @custom_form = custom_form
    @participation_method = custom_form.participation_context.pmethod
  end

  def all_fields
    fields = if @custom_form.custom_field_ids.empty?
      @participation_method.default_fields(@custom_form)
    else
      @custom_form.custom_fields.includes(:map_config, options: [:image])
    end

    fields = fields.to_a

    form_end_field = fields.find(&:form_end_page?)
    if form_end_field
      fields.delete(form_end_field)
      fields << form_end_field
    end

    fields
  end

  def xlsx_exportable_fields
    add_user_fields(all_fields).filter(&:supports_xlsx_export?)
  end

  def geojson_supported_fields
    all_fields.filter(&:supports_geojson?)
  end

  def visible_fields
    enabled_fields
  end

  def submittable_fields
    enabled_fields.select(&:submittable?)
  end

  def submittable_fields_with_other_options
    insert_other_option_text_fields(submittable_fields)
  end

  # Used in the printable PDF export
  def printable_fields
    enabled_fields_with_other_options(print_version: true).select(&:printable?)
  end

  # This supports the deprecated prawn based PDF export/import that did not support all field types
  def printable_fields_legacy
    enabled_fields_with_other_options.select(&:printable_legacy?)
  end

  def xlsx_importable_fields
    enabled_fields_with_other_options.select(&:xlsx_importable?)
  end

  def enabled_fields
    fields = all_fields.select(&:enabled?)
    add_user_fields(fields)
  end

  def enabled_fields_with_other_options(print_version: false)
    insert_other_option_text_fields(enabled_fields, print_version:)
  end

  def enabled_public_fields
    enabled_fields.select(&:visible_to_public?)
  end

  def extra_visible_fields
    visible_fields.reject(&:built_in?)
  end

  def survey_results_fields(structure_by_category: false)
    return enabled_fields unless structure_by_category && @participation_method.supports_custom_field_categories?

    # Restructure the results to order by category with each category as a page

    # Remove the original pages
    fields = enabled_fields.reject { |field| field.input_type == 'page' }

    # Order fields by the order of categories in custom field
    categories = CustomField::QUESTION_CATEGORIES
    sorted_fields = fields.sort_by do |field|
      [categories.index(field.question_category) || categories.size, field.ordering]
    end

    # Add a page per category
    categorised_fields = []
    current_category = nil
    sorted_fields.each do |field|
      if field.question_category != current_category
        categorised_fields << CustomField.new(
          id: SecureRandom.uuid,
          input_type: 'page',
          key: "category_#{field.question_category}",
          title_multiloc: field.question_category_multiloc
        )
      end
      current_category = field.question_category
      categorised_fields << field
    end
    categorised_fields
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

  def insert_other_option_text_fields(fields, print_version: false)
    all_fields = []
    fields.each do |field|
      all_fields << field
      all_fields << field.other_option_text_field(print_version:) if field.other_option_text_field(print_version:)
      all_fields << field.follow_up_text_field if field.follow_up_text_field && !print_version # NOTE: Currently not supported in print version
    end
    all_fields
  end

  # Check required as it doesn't matter what is saved in title for page 1
  # Constraints required for the front-end but response will always return input specific method
  def page1_title?(field, attribute)
    field.code == 'title_page' && attribute == :title_multiloc
  end

  def add_user_fields(fields)
    return fields unless @participation_method.user_fields_in_form?

    fields = fields.to_a # sometimes array passed in, sometimes active record relations

    # Remove the last page so we can add it back later
    last_page = fields.pop if fields.last.form_end_page?

    # Get the user fields from the permission (returns platform defaults if they don't exist)
    phase = @custom_form.participation_context
    permission = phase.permissions.find_by(action: 'posting_idea')
    user_fields = Permissions::UserRequirementsService.new.requirements_custom_fields(permission)

    # TODO: Hide any user fields that are locked for the user through the verification method

    # Transform the user fields to pretend to be idea fields
    user_fields.each do |field|
      field.dropdown_layout = true if field.dropdown_layout_type?
      field.code = nil # Remove the code so it doesn't appear as built in
      field.key = "u_#{field.key}" # Change the key so we cans clearly identify user data in the saved data
      field.resource = custom_form # User field pretend to be part of the form
    end

    user_page = CustomField.new(
      id: SecureRandom.uuid,
      key: 'user_page',
      title_multiloc: MultilocService.new.i18n_to_multiloc('form_builder.form_user_page.title_text'),
      resource: custom_form,
      input_type: 'page',
      page_layout: 'default'
    )

    # Change any logic end pages to reference the user page instead
    fields.each do |field|
      if field.logic['rules']
        field.logic['rules'].map! do |rule|
          rule['goto_page_id'] = user_page.id if rule['goto_page_id'] == last_page.id
          rule
        end
      elsif field.logic['next_page_id'] == last_page.id
        field.logic['next_page_id'] = user_page.id
      end
    end

    fields + [user_page] + user_fields + [last_page]
  end

  attr_reader :custom_form, :participation_method
end
