  class Api::V1::ResetPasswordController < ::ApplicationController

    skip_after_action :verify_authorized


    def reset_password_email
      @user = User.find_by!(email: params[:user][:email])
      token = ResetPasswordService.new.generate_reset_password_token @user
      @user.update(reset_password_token: token)
      UserMailer.reset_password(@user, token).deliver_later
      head :accepted
    end

    def reset_password
      @user = User.find_by(reset_password_token: reset_password_params[:token])
      if @user && ResetPasswordService.new.token_valid?(@user, reset_password_params[:token])
        if @user.update(password: reset_password_params[:password], reset_password_token: nil)
          render json: @user
        else
          render json: {errors: @user.errors.details}, status: :unprocessable_entity
        end
      else
        head :unauthorized
      end
    end

    private 

    def reset_password_params
      params.require(:user).permit(:token, :password)
    end

    def secure_controller?
      false
    end

  end