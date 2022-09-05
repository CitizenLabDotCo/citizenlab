# frozen_string_literal: true

class WebApi::V1::ResetPasswordController < ::ApplicationController
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  # Creates a password reset token and sends an email to the user with instructions.
  def reset_password_email
    user = User.not_invited.find_by_cimail! params[:user][:email]

    reset_password_service = ResetPasswordService.new
    token = reset_password_service.generate_reset_password_token user

    user.update! reset_password_token: token

    reset_password_service.send_email_later user, token
    reset_password_service.log_activity user, token
    head :accepted
  end

  def reset_password
    @user = User.not_invited
      .find_by(reset_password_token: reset_password_params[:token])
    if @user && ResetPasswordService.new.token_valid?(@user, reset_password_params[:token])
      if @user.update(password: reset_password_params[:password], reset_password_token: nil)
        render json: WebApi::V1::UserSerializer.new(
          @user,
          params: fastjson_params
        ).serialized_json
      else
        render json: { errors: @user.errors.details }, status: :unprocessable_entity
      end
    else
      render json: { errors: { token: [{ error: 'invalid', value: reset_password_params[:token] }] } }, status: :unauthorized
    end
  end

  private

  def reset_password_params
    params.require(:user).permit(:token, :password)
  end
end
