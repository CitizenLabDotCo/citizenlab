# frozen_string_literal: true

class WebApi::V1::PhoneConfirmationController < ApplicationController
  def send_confirmation_code
    authorize current_user, policy_class: RequestCodePolicy

    phone_number = request_code_params[:phone_number]
    code = rand(100000..999999).to_s.rjust(6, '0')

    phone_confirmation_service.send_confirmation_code!(
      phone_number, 
      code
    )

    head :ok
  end

  private

  def request_code_params
    params.permit(:phone_number)
  end

  def phone_confirmation_service
    @phone_confirmation_service ||= PhoneConfirmationService.new
  end
end