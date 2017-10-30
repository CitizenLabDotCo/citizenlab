class OmniauthCallbackController < ApplicationController
  include ActionController::Cookies
  skip_after_action :verify_authorized


  def create
    auth = request.env['omniauth.auth']

    @identity = Identity.find_with_omniauth(auth)

    if @identity.nil?
      @identity = Identity.create_with_omniauth(auth)
    end

    @user = @identity.user || User.find_by(email: auth.info.email)

    if @user
      @identity.update(user: @user) unless @identity.user
      set_auth_cookie
      redirect_to base_url
    else
      @user = User.build_with_omniauth(auth)
      SideFxUserService.new.before_create(@user, nil)
      @user.identities << @identity
      @user.save!
      SideFxUserService.new.after_create(@user, nil)
      set_auth_cookie
      redirect_to "#{base_url}/complete-signup"
    end

  end


  def secure_controller?
    false
  end

  def base_url
    if Rails.env.development?
      "http://localhost:3000"
    else
      transport = request.ssl? ? 'https' : 'http'
      "#{transport}://#{Tenant.current.host}"
    end
  end

  def auth_token entity
    if entity.respond_to? :to_token_payload
      Knock::AuthToken.new payload: entity.to_token_payload
    else
      Knock::AuthToken.new payload: { sub: entity.id }
    end
  end

  def set_auth_cookie
    cookies[:cl2_jwt] = {
      value: auth_token(@user).token,
      domain: Tenant.current.host,
      expires: 1.month.from_now
    }
  end

end
