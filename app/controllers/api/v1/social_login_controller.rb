class Api::V1::SocialLoginController < ::ApplicationController

  @@service = SocialAuthService.new

  def create
    skip_authorization
    network = login_params[:network]
    profile = @@service.get_social_profile_info network, login_params[:access_token]
    user = @@service.verify_user(network, profile)
    if (user)
      services = @@service.updated_user_services(user, network, profile)
      user.update(services: services)
      p user.errors
      render json: { jwt: create_jwt(user.id) }
    else
      head 404
    end
  end

  def create_jwt(user_id)
    Knock::AuthToken.new(payload: { sub: user_id }).token
  end

  def secure_controller?
    false
  end

  private
  def login_params
    params.require(:auth).permit(:network, :access_token)
  end
end
