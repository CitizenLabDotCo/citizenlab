# frozen_string_literal: true

class WebApi::V1::CustomFormsController < ApplicationController
  before_action :set_custom_form, only: %i[show update]

  def show
    render json: WebApi::V1::CustomFormSerializer.new(
      @custom_form,
      params: jsonapi_serializer_params,
      include: []
    ).serializable_hash
  end

  def update
    @custom_form.assign_attributes update_params
    if @custom_form.save
      SideFxCustomFormService.new.after_update(@custom_form, current_user, { updated: true })
      render json: WebApi::V1::CustomFormSerializer.new(
        @custom_form.reload,
        params: jsonapi_serializer_params,
        include: []
      ).serializable_hash, status: :ok
    else
      render json: { errors: @custom_form.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_custom_form
    
    @phase = Phase.find(params[:phase_id])
    authorize @phase
    
    if @phase.participation_method == 'ideation'
      @custom_form = CustomForm.find_or_initialize_by(participation_context: @phase.project)
    else
      @custom_form = CustomForm.find_or_initialize_by(participation_context: @phase)
    end
  end

  def update_params
    params.require(:custom_form).permit(
      print_start_multiloc: CL2_SUPPORTED_LOCALES,
      print_end_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end
