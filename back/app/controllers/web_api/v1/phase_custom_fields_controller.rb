# frozen_string_literal: true

class WebApi::V1::PhaseCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def json_forms_schema
    if phase
      render json: raw_json(JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user, phase.pmethod, phase.input_term))
    else
      send_not_found
    end
  end

  private

  # @return [Phase]
  def phase
    @phase ||= Phase.find params[:phase_id]
  end

  def custom_fields
    IdeaCustomFieldsService.new(phase.pmethod.custom_form).enabled_fields_with_other_options
  end
end

WebApi::V1::PhaseCustomFieldsController.include(AggressiveCaching::Patches::WebApi::V1::PhaseCustomFieldsController)
