# frozen_string_literal: true

# Services to generate a json schema and UI schema for a CustomForm, compatible
# with jsonforms.io.
class JsonFormsService
  include JsonFormsIdeasOverrides

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
    { json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc }
  end

  private

  def allowed_fields(fields, current_user)
    override_method = "#{fields.first.resource_type.underscore}_allowed_fields"
    if respond_to?(override_method, true)
      send(override_method, fields, current_user)
    else
      fields
    end
  end
end
