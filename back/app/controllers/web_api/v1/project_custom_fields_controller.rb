# frozen_string_literal: true

class WebApi::V1::ProjectCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def json_forms_schema
    if project && phase
      render json: raw_json(JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user, phase.pmethod, phase.input_term))
    else
      send_not_found
    end
  end

  private

  def project
    @project ||= Project.find_by id: params[:project_id]
  end

  def phase
    @phase ||= TimelineService.new.current_or_backup_transitive_phase(project)
  end

  def custom_fields
    IdeaCustomFieldsService.new(phase.pmethod.custom_form).enabled_fields
  end
end

WebApi::V1::ProjectCustomFieldsController.include(AggressiveCaching::Patches::WebApi::V1::ProjectCustomFieldsController)
