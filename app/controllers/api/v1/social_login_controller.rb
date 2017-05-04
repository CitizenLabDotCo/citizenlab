class Api::V1::SocialLoginController < ::ApplicationController
  MissingEmail = Class.new(StandardError)

  def create
    skip_authorization
    user = verify_social_login
    send_success({ jwt: create_jwt(user.id) })
  rescue RestClient::BadRequest
    send_error({ message: 'invalid token' })
  rescue ActiveRecord::RecordNotFound, MissingEmail
    send_not_found
  end

  def verify_social_login
    # TODO add support for other networks
    find_user(get_facebook_profile_email)
  end

  def get_facebook_profile_email
    response = RestClient.get('https://graph.facebook.com/me', params: { access_token: login_params[:access_token], fields: 'name,first_name,last_name,email' })
    result = JSON.parse(response.body)
    email = result["email"]
    raise MissingEmail if email.blank?
    email
  end

  def find_user(email)
    User.find_by!(email: email)
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
