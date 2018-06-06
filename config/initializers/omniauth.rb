FACEBOOK_SETUP_PROC = lambda do |env| 
  request = Rack::Request.new(env)
  tenant = Tenant.current
  if tenant.has_feature('facebook_login')
    env['omniauth.strategy'].options[:client_id] = Tenant.settings("facebook_login", "app_id")
    env['omniauth.strategy'].options[:client_secret] = Tenant.settings("facebook_login", "app_secret")
    env['omniauth.strategy'].options[:info_fields] = "first_name,last_name,email,birthday,education,gender,locale,third_party_id,timezone,age_range,picture.width(640).height(640)"
  end
end

GOOGLE_SETUP_PROC = lambda do |env|
  request = Rack::Request.new(env)
  tenant = Tenant.current
  if tenant.has_feature('google_login')
    env['omniauth.strategy'].options[:client_id] = Tenant.settings("google_login", "client_id")
    env['omniauth.strategy'].options[:client_secret] = Tenant.settings("google_login", "client_secret")
    env['omniauth.strategy'].options[:image_size] = 640
    env['omniauth.strategy'].options[:image_aspect_ratio] = "square"
  end
end

# TWITTER_SETUP_PROC = lambda do |env|
#   request = Rack::Request.new(env)
#   tenant = Tenant.current
#   if tenant.has_feature('twitter_login')
#     env['omniauth.strategy'].options[:client_id] = Tenant.settings("twitter_login", "api_key")
#     env['omniauth.strategy'].options[:client_secret] = Tenant.settings("twitter_login", "api_secret")
#   end
# end

# MYDIGIPASS_SETUP_PROC = lambda do |env|
#   request = Rack::Request.new(env)
#   tenant = Tenant.current
#   if tenant.has_feature('mydigipass_login')
#     env['omniauth.strategy'].options[:client_id] = Tenant.settings("mydigipass_login", "client_id")
#     env['omniauth.strategy'].options[:client_secret] = Tenant.settings("mydigipass_login", "client_secret")

#     redirect_uri = "#{Tenant.current.base_backend_uri}/auth/mydigipass/callback"
#     env['omniauth.strategy'].options.token_params[:redirect_uri] = redirect_uri
#     if Tenant.settings('mydigipass_login','require_eid')
#       env['omniauth.strategy'].options.authorize_params[:scope] = "eid_profile eid_address email profile"
#     else
#       env['omniauth.strategy'].options.authorize_params[:scope] = "email profile"
#     end
#   end
# end


   
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, :setup => FACEBOOK_SETUP_PROC
  provider :google_oauth2, :setup => GOOGLE_SETUP_PROC, name: 'google'
  # provider :twitter, :setup => TWITTER_SETUP_PROC
  # provider :mydigipass, :setup => MYDIGIPASS_SETUP_PROC
end


OmniAuth.config.full_host = -> (env) {
  Tenant.current&.base_backend_uri
}