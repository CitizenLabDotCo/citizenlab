# frozen_string_literal: true

class WebApi::V1::ProjectCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def schema
    if participation_context
      render json: CustomFieldService.new.ui_and_json_multiloc_schemas(AppConfiguration.instance, custom_fields)
    else
      send_not_found
    end
  end

  def json_forms_schema
    if participation_context
      render json: JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user)
    else
      send_not_found
    end
  end

  private

  def project
    @project ||= Project.find_by id: params[:project_id]
  end

  def participation_context
    @participation_context ||= determine_participation_context
  end

  def determine_participation_context
    return unless project
    return project if project.continuous?

    phase = ParticipationContextService.new.get_participation_context(project)
    return unless phase

    participation_method = Factory.instance.participation_method_for phase
    participation_method.form_in_phase? ? phase : project
  end

  def custom_fields
    IdeaCustomFieldsService.new(custom_form).enabled_fields
  end

  def custom_form
    participation_context.custom_form || CustomForm.new(participation_context: participation_context)
  end
end
