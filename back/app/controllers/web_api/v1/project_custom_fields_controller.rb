# frozen_string_literal: true

class WebApi::V1::ProjectCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def json_forms_schema
    if project && participation_context
      render json: raw_json(JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user, input_term))
    else
      send_not_found
    end
  end

  private

  def project
    @project ||= Project.find_by id: params[:project_id]
  end

  def participation_context
    @participation_context ||= ParticipationContextService.new.get_participation_context project
  end

  def input_term
    participation_context ? participation_context.input_term : project.input_term
  end

  def custom_fields
    IdeaCustomFieldsService.new(Factory.instance.participation_method_for(participation_context).custom_form).enabled_fields
  end
end
