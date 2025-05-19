# frozen_string_literal: true

# Service to generate a json schema and UI schema for a CustomForm, compatible
# with jsonforms.io.
class JsonFormsService
  AUTHOR_FIELD = CustomField.new(
    key: 'author_id',
    code: 'author_id',
    input_type: 'text',
    title_multiloc: MultilocService.new.i18n_to_multiloc('custom_fields.ideas.author_id.title', locales: CL2_SUPPORTED_LOCALES),
    required: false,
    enabled: true
  )
  BUDGET_FIELD = CustomField.new(
    key: 'budget',
    code: 'budget',
    input_type: 'number',
    title_multiloc: MultilocService.new.i18n_to_multiloc('custom_fields.ideas.budget.title', locales: CL2_SUPPORTED_LOCALES),
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

  def input_ui_and_json_multiloc_schemas(fields, current_user, participation_method, input_term)
    return if fields.empty?

    fields.reject!(&:hidden?)
    add_author_budget_fields! fields, current_user, participation_method
    json_schema_multiloc = InputJsonSchemaGeneratorService.new.generate_for fields
    ui_schema_multiloc = InputUiSchemaGeneratorService.new(input_term, participation_method.supports_answer_visible_to?).generate_for fields
    {
      json_schema_multiloc: json_schema_multiloc,
      ui_schema_multiloc: ui_schema_multiloc
    }
  end

  private

  def add_author_budget_fields!(fields, current_user, participation_method)
    if participation_method.author_in_form? current_user
      author_idx = fields.index { |field| field.code == 'title_multiloc' } # Insert above the title field
      fields.insert(author_idx, AUTHOR_FIELD)
    end

    if participation_method.budget_in_form? current_user
      {
        'details_page' => 1, # Insert at the top of the details page if the page exists.
        'proposed_budget' => 0, # Insert before the proposed budget field if there is no details page.
        'body_multiloc' => 1 # Insert below the body field if there is no details page or proposed budget field.
      }.each do |field_code, idx_diff|
        field_idx = fields.index { |field| field.code == field_code }
        if field_idx
          budget_idx = field_idx + idx_diff
          fields.insert(budget_idx, BUDGET_FIELD)
          break
        end
      end
    end
  end
end
