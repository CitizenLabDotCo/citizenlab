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
    enabled: true,
    answer_visible_to: 'public'
  )
  BUDGET_FIELD = CustomField.new(
    key: 'budget',
    code: 'budget',
    input_type: 'number',
    title_multiloc: MultilocService.new.i18n_to_multiloc('custom_fields.ideas.budget.title', locales: CL2_SUPPORTED_LOCALES),
    required: false,
    enabled: true,
    answer_visible_to: 'public'
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

    add_author_budget_fields! fields, current_user
    participation_context = fields.first.resource.participation_context
    supports_answer_visible_to = Factory.instance.participation_method_for(participation_context).supports_answer_visible_to?

    visible_fields = fields.reject do |field|
      !field.enabled? || field.hidden?
    end
    json_schema_multiloc = InputJsonSchemaGeneratorService.new.generate_for visible_fields
    ui_schema_multiloc = InputUiSchemaGeneratorService.new(input_term, supports_answer_visible_to).generate_for visible_fields
    {
      json_schema_multiloc: json_schema_multiloc,
      ui_schema_multiloc: ui_schema_multiloc
    }
  end

  private

  def add_author_budget_fields!(fields, current_user)
    participation_method = Factory.instance.participation_method_for fields.first.resource.participation_context # TODO: Move to callers

    if participation_method.author_in_form? current_user
      title_idx = fields.index { |field| field.code == 'title_multiloc' }
      author_idx = title_idx + 1 # Insert below the title field
      fields.insert(author_idx, AUTHOR_FIELD)
    end

    if participation_method.budget_in_form? current_user
      {
        'ideation_section3' => 1, # Insert at the top of the details section if the section exists.
        'proposed_budget'   => 0, # Insert before the proposed budget field if there is no details section.
        'body_multiloc'     => 1  # Insert below the body field if there is no details section or proposed budget field.
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

  # def old_add_author_budget_fields!(output, fields, current_user)
  #   participation_method = Factory.instance.participation_method_for fields.first.resource.participation_context

  #   if participation_method.author_in_form? current_user
  #     add_author_field_to_json_schema_multiloc! output[:json_schema_multiloc]
  #     add_author_field_to_ui_schema_multiloc! output[:ui_schema_multiloc], fields
  #   end

  #   if participation_method.budget_in_form? current_user
  #     add_budget_field_to_json_schema_multiloc! output[:json_schema_multiloc]
  #     add_budget_field_to_ui_schema_multiloc! output[:ui_schema_multiloc], fields
  #   end
  # end

  # def add_author_field_to_json_schema_multiloc!(json_schema_multiloc)
  #   each_schema_with_locale(json_schema_multiloc) do |json_schema|
  #     json_schema[:properties]['author_id'] = InputJsonSchemaGeneratorService.new.visit_text AUTHOR_FIELD
  #   end
  # end

  # def add_author_field_to_ui_schema_multiloc!(ui_schema_multiloc, fields)
  #   each_schema_with_locale(ui_schema_multiloc) do |ui_schema|
  #     schema_main_section = ui_schema[:elements].find do |elt|
  #       elt.dig(:options, :id) == fields.find { |field| field.code == 'ideation_section1' }.id
  #     end
  #     schema_main_section[:elements].insert 1, InputUiSchemaGeneratorService.new(nil, true).visit_text(AUTHOR_FIELD)
  #   end
  # end

  # def add_budget_field_to_json_schema_multiloc!(json_schema_multiloc)
  #   each_schema_with_locale(json_schema_multiloc) do |json_schema|
  #     json_schema[:properties]['budget'] = InputJsonSchemaGeneratorService.new.visit_number BUDGET_FIELD
  #   end
  # end

  # def add_budget_field_to_ui_schema_multiloc!(ui_schema_multiloc, fields)
  #   budget_schema = InputUiSchemaGeneratorService.new(nil, true).visit_number BUDGET_FIELD
  #   each_schema_with_locale(ui_schema_multiloc) do |ui_schema|
  #     details_section_id = fields.find { |field| field.code == 'ideation_section3' }&.id
  #     if details_section_id
  #       # Insert at the top of the details section if the section exists.
  #       details_section = ui_schema[:elements].find do |elt|
  #         elt.dig(:options, :id) == details_section_id
  #       end
  #       details_section[:elements].insert 0, budget_schema
  #     elsif fields.find { |field| field.code == 'proposed_budget' }
  #       # Insert before the proposed budget if there is no details section.
  #       budget_section = ui_schema[:elements].find do |elt|
  #         elt[:elements].any? do |subelt|
  #           subelt[:scope] == '#/properties/proposed_budget'
  #         end
  #       end
  #       budget_position = budget_section[:elements].index do |elt|
  #         elt[:scope] == '#/properties/proposed_budget'
  #       end
  #       budget_section[:elements].insert budget_position, budget_schema
  #     else
  #       # Insert below the body_multiloc field if there is no details section or proposed budget field.
  #       schema_main_section = ui_schema[:elements].find do |elt|
  #         elt.dig(:options, :id) == fields.find { |field| field.code == 'ideation_section1' }.id
  #       end
  #       body_multiloc_position = schema_main_section[:elements].index do |elt|
  #         elt.dig(:options, :input_type) == 'html_multiloc' && elt[:elements].first[:scope].starts_with?('#/properties/body_multiloc/properties')
  #       end
  #       schema_main_section[:elements].insert (body_multiloc_position + 1), budget_schema
  #     end
  #   end
  # end

  # def each_schema_with_locale(schema_multiloc)
  #   schema_multiloc.each do |locale, schema|
  #     I18n.with_locale(locale) do
  #       yield schema
  #     end
  #   end
  # end
end
