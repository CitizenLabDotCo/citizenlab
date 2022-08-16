# frozen_string_literal: true

# Service to generate a json schema and UI schema for a CustomForm, compatible
# with jsonforms.io.
class JsonFormsService
  def initialize
    @configuration = AppConfiguration.instance
    @multiloc_service = MultilocService.new app_configuration: @configuration
  end

  def ui_and_json_multiloc_schemas(fields, current_user)
    resource_types = fields.map(&:resource_type).uniq
    raise "Can't render a UI schema for fields belonging to different resource types" if resource_types.many?
    return nil if resource_types.empty?

    resource_type = resource_types.first

    visible_fields = allowed_fields(fields, current_user).reject do |field|
      !field.enabled? || field.hidden?
    end
    json_schema_generator_class = Factory.instance.json_schema_generator_class_for resource_type
    json_schema_multiloc = json_schema_generator_class.new.generate_for visible_fields
    ui_schema_generator_class = Factory.instance.ui_schema_generator_class_for resource_type
    ui_schema_multiloc = ui_schema_generator_class.new.generate_for visible_fields
    {
      json_schema_multiloc: json_schema_multiloc,
      ui_schema_multiloc: ui_schema_multiloc
    }
  end

  private

  def allowed_fields(fields, current_user)
    if fields.first.resource_type.underscore == 'custom_form'
      custom_form_allowed_fields(fields, current_user)
    else
      fields
    end
  end

  # Some custom fields have to exist but are only shown to admins, like the author picker when the feature is enabled and the budget fields in pb contexts. (not to confuse with the proposed_budget visible to everyone, when enabled, whatever the feature flag, which is weird, but seems to be the expected behaviour).
  # A good solution would be to add this info to the CustomField model. Like adminOnly and a feature name to enable or disable automatically, but this would have to be done right to build the foundations of a permission system informing who can modify the field, access the data filled in through the field, or fill the field in themselves, and that was out of scope.
  def custom_form_allowed_fields(fields, current_user)
    fields.filter do |field|
      case field.code
      when 'author_id'
        author_field_allowed? field, current_user
      when 'budget'
        budget_field_allowed? field, current_user
      else
        true
      end
    end
  end

  def author_field_allowed?(field, current_user)
    AppConfiguration.instance.feature_activated?('idea_author_change') &&
      current_user &&
      UserRoleService.new.can_moderate_project?(field.resource.project, current_user)
  end

  def budget_field_allowed?(field, current_user)
    return false unless AppConfiguration.instance.feature_activated?('participatory_budgeting')
    return false unless current_user
    return false unless UserRoleService.new.can_moderate_project?(field.resource.project, current_user)

    (
      field.resource.project&.process_type == 'continuous' &&
      field.resource.project&.participation_method == 'budgeting'
    ) || (
      field.resource.project&.process_type == 'timeline' &&
      field.resource.project&.phases&.any? { |p| p.participation_method == 'budgeting' }
    )
  end
end
