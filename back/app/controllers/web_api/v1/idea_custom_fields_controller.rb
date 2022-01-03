class WebApi::V1::IdeaCustomFieldsController < ApplicationController
  before_action :set_custom_form, only: [:schema, :json_forms_schema]
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def schema
    @idea_form_fields = IdeaCustomFieldsService.new.all_fields(@custom_form)
    render json: CustomFieldService.new.ui_and_json_multiloc_schemas(AppConfiguration.instance, @idea_form_fields)
  end

  def json_forms_schema
    service = JsonFormsService.new
    idea_form_fields = IdeaCustomFieldsService.new.all_fields(@custom_form)

    schema = service.form_to_json_schema(idea_form_fields)
    ui_schema = service.form_to_ui_schema(idea_form_fields)
    render json: {
      schema: schema,
      ui_schema: ui_schema
    }
  end

  private

  def set_custom_form
    @project = Project.find(params[:project_id])
    @custom_form = @project.custom_form || CustomForm.new(project: @project)
  end
end
