# frozen_string_literal: true

# Service to generate a json schema and UI schema for a CustomForm, compatible
# with jsonforms.io.
class JsonFormsService
  AUTHOR_FIELD = CustomField.new(
    key: 'author_id',
    code: 'author_id',
    input_type: 'text',
    title_multiloc: MultilocService.new.i18n_to_multiloc(
      'custom_fields.ideas.author_id.title',
      locales: CL2_SUPPORTED_LOCALES
    ),
    description_multiloc: begin
      MultilocService.new.i18n_to_multiloc(
        'custom_fields.ideas.author_id.description',
        locales: CL2_SUPPORTED_LOCALES
      )
    rescue StandardError
      {}
    end,
    required: false,
    enabled: true
  )
  BUDGET_FIELD = CustomField.new(
    key: 'budget',
    code: 'budget',
    input_type: 'number',
    title_multiloc: MultilocService.new.i18n_to_multiloc('custom_fields.ideas.budget.title', locales: CL2_SUPPORTED_LOCALES),
    description_multiloc: begin
      MultilocService.new.i18n_to_multiloc('custom_fields.ideas.budget.description', locales: CL2_SUPPORTED_LOCALES)
    rescue StandardError
      {}
    end,
    required: false,
    enabled: true
  )

  def initialize
    @configuration = AppConfiguration.instance
    @multiloc_service = MultilocService.new app_configuration: @configuration
  end

  def user_ui_and_json_multiloc_schemas(fields)
    return if fields.empty?

    visible_fields = fields.reject do |field|
      !field.enabled? || field.hidden?
    end
    json_schema_multiloc = UserJsonSchemaGeneratorService.new.generate_for visible_fields
    ui_schema_multiloc = UserUiSchemaGeneratorService.new.generate_for visible_fields
    {
      json_schema_multiloc: json_schema_multiloc,
      ui_schema_multiloc: ui_schema_multiloc
    }
  end

  def input_ui_and_json_multiloc_schemas(fields, current_user, input_term)
    return if fields.empty?

    visible_fields = fields.reject do |field|
      !field.enabled? || field.hidden?
    end
    json_schema_multiloc = InputJsonSchemaGeneratorService.new.generate_for visible_fields
    ui_schema_multiloc = InputUiSchemaGeneratorService.new(input_term).generate_for visible_fields
    {
      json_schema_multiloc: json_schema_multiloc,
      ui_schema_multiloc: ui_schema_multiloc
    }.tap do |output|
      add_author_budget_fields! output, fields, current_user
    end
  end

  private

  def add_author_budget_fields!(output, fields, current_user)
    participation_context = fields.first.resource.participation_context
    return if !Factory.instance.participation_method_for(participation_context).include_author_budget_in_schema?

    project = participation_context.project

    if author_field_allowed? project, current_user
      output[:json_schema_multiloc].each_value do |json_schema|
        json_schema[:properties]['author_id'] = InputJsonSchemaGeneratorService.new.visit_text AUTHOR_FIELD
      end
      output[:ui_schema_multiloc].each_value do |ui_schema|
        schema_main_section = ui_schema[:elements].find do |elt|
          elt.dig(:options, :id) == fields.find { |field| field.code == 'ideation_section1' }.id
        end
        schema_main_section[:elements].insert 1, InputUiSchemaGeneratorService.new(nil).visit_text(AUTHOR_FIELD)
      end
    end

    if budget_field_allowed? project, current_user
      output[:json_schema_multiloc].each_value do |json_schema|
        json_schema[:properties]['budget'] = InputJsonSchemaGeneratorService.new.visit_number BUDGET_FIELD
      end
      output[:ui_schema_multiloc].each_value do |ui_schema|
        details_section_id = fields.find { |field| field.code == 'ideation_section3' }&.id
        if details_section_id
          details_section = ui_schema[:elements].find do |elt|
            elt.dig(:options, :id) == details_section_id
          end
          details_section[:elements].insert 0, InputUiSchemaGeneratorService.new(nil).visit_number(BUDGET_FIELD)
        elsif fields.find { |field| field.code == 'proposed_budget' }
          budget_section = ui_schema[:elements].find do |elt|
            elt[:elements].any? do |subelt|
              subelt[:scope] == '#/properties/proposed_budget'
            end
          end
          budget_position = budget_section[:elements].index do |elt|
            elt[:scope] == '#/properties/proposed_budget'
          end
          budget_section[:elements].insert budget_position, InputUiSchemaGeneratorService.new(nil).visit_number(BUDGET_FIELD)
        else
          schema_main_section = ui_schema[:elements].find do |elt|
            elt.dig(:options, :id) == fields.find { |field| field.code == 'ideation_section1' }.id
          end
          body_multiloc_position = schema_main_section[:elements].index do |elt|
            elt.dig(:options, :input_type) == 'html_multiloc' && elt[:elements].first[:scope].starts_with?('#/properties/body_multiloc/properties')
          end
          schema_main_section[:elements].insert (body_multiloc_position + 1), InputUiSchemaGeneratorService.new(nil).visit_number(BUDGET_FIELD)
        end
      end
    end
  end

  def author_field_allowed?(project, current_user)
    AppConfiguration.instance.feature_activated?('idea_author_change') &&
      current_user &&
      UserRoleService.new.can_moderate_project?(project, current_user)
  end

  def budget_field_allowed?(project, current_user)
    return false unless AppConfiguration.instance.feature_activated?('participatory_budgeting')
    return false unless current_user
    return false unless UserRoleService.new.can_moderate_project?(project, current_user)

    (
      project&.process_type == 'continuous' &&
      project&.participation_method == 'budgeting'
    ) || (
      project&.process_type == 'timeline' &&
      project&.phases&.any? { |p| p.participation_method == 'budgeting' }
    )
  end
end
