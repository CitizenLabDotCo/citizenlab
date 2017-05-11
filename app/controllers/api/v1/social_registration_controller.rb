class Api::V1::SocialRegistrationController < ::ApplicationController

  @@service = SocialAuthService.new

  def create
    social_profile = @@service.get_social_profile_info(register_params[:network], register_params[:access_token])
    user_attrs = @@service.social_profile_to_user_attrs register_params[:network], social_profile
    @user = User.new(user_attrs.merge(locale: register_params[:locale]))
    authorize @user
    if @user.save
      UserMailer.welcome(@user).deliver_later
      render json: @user, status: :created
    else
      render json: {errors: @user.errors.details }, status: :unprocessable_entity
    end
  end

  def register_params
    params.require(:auth).permit(:network, :access_token, :locale)
  end

  def secure_controller?
    false
  end

end