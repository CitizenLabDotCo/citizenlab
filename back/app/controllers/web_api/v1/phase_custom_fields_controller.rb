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

  def to_pdf
    locale = params[:locale] || current_user.locale
    personal_data_enabled = params[:personal_data] == 'true'
    if phase
      pdf = PrintCustomFieldsService.new(
        phase,
        custom_fields,
        locale,
        personal_data_enabled
      ).create_pdf

      send_data(
        pdf.render,
        type: 'application/pdf',
        filename: 'survey.pdf'
      )
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
