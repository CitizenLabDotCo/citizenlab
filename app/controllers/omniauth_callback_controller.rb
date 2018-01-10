class OmniauthCallbackController < ApplicationController
  include ActionController::Cookies
  skip_after_action :verify_authorized


  def create
    auth = request.env['omniauth.auth']
    omniauth_params = request.env['omniauth.params']

    @identity = Identity.find_with_omniauth(auth)

    if @identity.nil?
      @identity = Identity.create_with_omniauth(auth)
    end

    @user = @identity.user || User.find_by(email: auth.info.email)

    if @user
      @identity.update(user: @user) unless @identity.user
      set_auth_cookie
      redirect_to(add_uri_params(FrontendService.new.signin_success_url, omniauth_params))
    else
      @user = User.build_with_omniauth(auth)
      SideFxUserService.new.before_create(@user, nil)
      @user.identities << @identity
      begin
        @user.save!
        SideFxUserService.new.after_create(@user, nil)
        set_auth_cookie
        redirect_to(add_uri_params(FrontendService.new.signup_success_url, omniauth_params))

      rescue ActiveRecord::RecordInvalid => e
        redirect_to(add_uri_params(FrontendService.new.signin_failure_url, omniauth_params))
      end
    end

  end

  def failure
    omniauth_params = request.env['omniauth.params']

    redirect_to(add_uri_params(FrontendService.new.signin_failure_url, omniauth_params))
  end


  def secure_controller?
    false
  end

  def add_uri_params uri, params={}
    uri =  URI.parse(uri)
    new_query_ar = URI.decode_www_form(String(uri.query))
    params&.each do |key, value|
      new_query_ar << [key, value]
    end
    uri.query = URI.encode_www_form(new_query_ar)
    uri.to_s
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
      expires: 1.month.from_now
    }
  end


end
