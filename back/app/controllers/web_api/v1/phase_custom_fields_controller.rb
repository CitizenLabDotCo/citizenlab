# frozen_string_literal: true

class WebApi::V1::PhaseCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  def schema
    if phase
      render json: CustomFieldService.new.ui_and_json_multiloc_schemas(AppConfiguration.instance, custom_fields)
    else
      send_not_found
    end
  end

  def json_forms_schema
    if phase
      render json: JsonFormsService.new.input_ui_and_json_multiloc_schemas(custom_fields, current_user)
    else
      send_not_found
    end
  end

  private

  def phase
    @phase ||= Phase.find params[:phase_id]
  end

  def custom_fields
    IdeaCustomFieldsService.new(custom_form).enabled_fields
  end

  def custom_form
    participation_method = Factory.instance.participation_method_for phase
    if participation_method.form_in_phase?
      phase.custom_form || CustomForm.new(participation_context: phase)
    else
      phase.project.custom_form || CustomForm.new(participation_context: phase.project)
    end
  end
end
