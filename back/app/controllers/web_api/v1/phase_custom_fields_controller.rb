# frozen_string_literal: true

class WebApi::V1::PhaseCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def schema
    render json: CustomFieldService.new.ui_and_json_multiloc_schemas(AppConfiguration.instance, custom_fields)
  end

  def json_forms_schema
    render json: JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user)
  end

  private

  def phase
    @phase ||= Phase.find_by(id: params[:phase_id])
  end

  def custom_fields
    @custom_fields ||= IdeaCustomFieldsService.new(custom_form).all_fields
  end

  def custom_form
    if phase
      phase.custom_form || CustomForm.new(participation_context: phase)
    else
      project.custom_form || CustomForm.new(participation_context: project)
    end
  end
end
