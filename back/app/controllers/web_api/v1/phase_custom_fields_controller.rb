# frozen_string_literal: true

class WebApi::V1::PhaseCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def json_forms_schema
    if phase
      render json: raw_json(JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user, phase.input_term))
    else
      send_not_found
    end
  end

  private

  def phase
    @phase ||= Phase.find params[:phase_id]
  end

  def custom_fields
    IdeaCustomFieldsService.new(Factory.instance.participation_method_for(phase).custom_form).enabled_fields
  end
end
