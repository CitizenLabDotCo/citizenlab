# frozen_string_literal: true

class WebApi::V1::PulseChecksController < ApplicationController
  before_action :set_pulse_check, only: %i[answer dismiss]

  def show_next
    authorize PulseCheck
    errors = show_next_param_errors
    if errors.present?
      render json: { errors: errors }, status: :unprocessable_entity
      return
    end

    pulse_check = PulseCheckService.new.show_next(
      current_user,
      trigger: params[:trigger],
      ui_version: params[:ui_version],
      admin_area: admin_area_param,
      project_id: params[:project_id]
    )

    if pulse_check
      render json: serialize(pulse_check)
    else
      head :no_content
    end
  end

  def answer
    if @pulse_check.update(answer_params.merge(status: 'answered', responded_at: @pulse_check.responded_at || Time.zone.now))
      render json: serialize(@pulse_check)
    else
      render json: { errors: @pulse_check.errors.details }, status: :unprocessable_entity
    end
  end

  def dismiss
    @pulse_check.update!(status: 'dismissed', responded_at: Time.zone.now)
    render json: serialize(@pulse_check)
  end

  private

  def set_pulse_check
    @pulse_check = PulseCheck.find(params[:id])
    authorize @pulse_check
  end

  # Checked upfront, since an invalid value would only fail once a due pulse check is
  # being marked as shown.
  def show_next_param_errors
    errors = {}
    errors[:trigger] = [{ error: 'inclusion' }] unless PulseCheck::TRIGGERS.include?(params[:trigger])
    errors[:ui_version] = [{ error: 'inclusion' }] unless PulseCheck::UI_VERSIONS.include?(params[:ui_version])
    errors
  end

  def admin_area_param
    admin_area = params[:admin_area].to_s
    admin_area if PulseCheck::ADMIN_AREA_FORMAT.match?(admin_area)
  end

  def answer_params
    params.require(:pulse_check).permit(:score, :comment)
  end

  def serialize(pulse_check)
    WebApi::V1::PulseCheckSerializer.new(pulse_check, params: jsonapi_serializer_params).serializable_hash
  end
end
