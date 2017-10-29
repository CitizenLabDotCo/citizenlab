class OmniauthCallbackController < ApplicationController
  include ActionController::Cookies
  skip_after_action :verify_authorized

  # def create
  #   auth = request.env['omniauth.auth']
  #   render plain: auth.to_json
  # end

  def create
    auth = request.env['omniauth.auth']
    # Find an identity here
    @identity = Identity.find_with_omniauth(auth)

    if @identity.nil?
      # If no identity was found, create a brand new one here
      @identity = Identity.create_with_omniauth(auth)
    end

    @user = @identity.user || User.find_by(email: auth.info.email)

    unless @user
      @user = User.build_with_omniauth(auth)
      SideFxUserService.new.before_create(@user, nil)
      @user.identities << @identity
      @user.save!
      SideFxUserService.new.after_create(@user, nil)
    end

    @identity.update(user: @user) unless @identity.user


    cookies[:cl2_jwt] = {
      value: auth_token(@user).token,
      domain: Tenant.current.host,
      expires: 1.month.from_now
    }
    redirect_to 'http://localhost:3000'
  end


  def secure_controller?
    false
  end

  def auth_token entity
    if entity.respond_to? :to_token_payload
      Knock::AuthToken.new payload: entity.to_token_payload
    else
      Knock::AuthToken.new payload: { sub: entity.id }
    end
  end

end
