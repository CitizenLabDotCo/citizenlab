# frozen_string_literal: true

class WebApi::V1::ResetPasswordController < ApplicationController
  skip_after_action :verify_authorized
  skip_before_action :authenticate_user

  # Creates a password reset token and sends an email to the user with instructions.
  def reset_password_email
    user = User.not_invited.find_by_cimail params[:user][:email]
    if user
      reset_password_service = ResetPasswordService.new
      token = reset_password_service.generate_reset_password_token user

      user.update! reset_password_token: token

      reset_password_service.send_email_later user, token
      reset_password_service.log_activity user, token
    end
    head :accepted
  end

  def reset_password
    @user = User.not_invited
      .find_by(reset_password_token: reset_password_params[:token])

    if @user && ResetPasswordService.new.token_valid?(@user, reset_password_params[:token])
      @user.assign_attributes(
        password: reset_password_params[:password],
        reset_password_token: nil
      )

      # Resetting the password also proves that the user has access to the email,
      # so we can confirm the user if they were pending confirmation.
      @user.confirm if @user.confirmation_required?

      if @user.save
        render json: WebApi::V1::UserSerializer.new(
          @user,
          params: jsonapi_serializer_params
        ).serializable_hash
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
