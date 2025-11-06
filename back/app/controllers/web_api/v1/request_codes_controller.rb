# frozen_string_literal: true

class WebApi::V1::RequestCodesController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized

  def request_code_unauthenticated
    email = request_code_unauthenticated_params[:email]
    user = User.find_by(email: email)
    binding.pry
    
    if user
      authorize user, :request_code_unauthenticated?
      head :ok
    else
      head :ok
    end
  end

  private

  def request_code_unauthenticated_params
    params.require(:request_code).permit(:email, :code)
  end

  # skip_after_action :verify_authorized
  # before_action :authenticate_user, except: [:resend_code_unauthenticated]

  # def create
  #   RequestConfirmationCodeJob.perform_now current_user, new_email: resend_code_params[:new_email]
  #   if current_user.valid?
  #     head :ok
  #   else
  #     render json: { errors: current_user.errors.details }, status: :unprocessable_entity
  #   end
  # end

  # def resend_code_unauthenticated
  #   email = resend_code_unauthenticated_params
  #   user = User.find_by(email: email)

  #   if user
  #     RequestConfirmationCodeJob.perform_now user, new_email: nil
  #     head :ok
  #   else
  #     render json: { errors: { email: [{ error: 'not_found' }] } }, status: :not_found
  #   end
  # end

  # private

  # def resend_code_params
  #   params.permit(:new_email)
  # end

  # def resend_code_unauthenticated_params
  #   params.require(:email)
  # end
end
