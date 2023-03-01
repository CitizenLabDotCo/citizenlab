# frozen_string_literal: true

class WebApi::V1::ProjectCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def json_forms_schema
    if participation_context_for_form
      render json: raw_json(JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user, input_term))
    else
      send_not_found
    end
  end

  private

  def project
    @project ||= Project.find_by id: params[:project_id]
  end

  def input_term
    participation_context = ParticipationContextService.new.get_participation_context(project)
    participation_context ? participation_context.input_term : project.input_term
  end

  def participation_context_for_form
    @participation_context_for_form ||= determine_participation_context_for_form
  end

  def determine_participation_context_for_form
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
    participation_context_for_form.custom_form || CustomForm.new(participation_context: participation_context_for_form)
  end
end
