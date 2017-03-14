class Api::V1::LoginController < ::ApplicationController
  MissingEmail = Class.new(StandardError)

  def create
    skip_authorization
    # TODO add support for other networks
    user = find_user(get_facebook_profile["email"])

    send_success({
      data: { jwt: create_jwt(user.id) }
    })
  # TODO: send proper json api error objects
  rescue RestClient::BadRequest
    send_error({ message: 'invalid token' })
  rescue ActiveRecord::RecordNotFound
  rescue MissingEmail
    # TODO: do user registration and send a jwt
    send_error({ message: 'user not registered' })
  end

  def get_facebook_profile
    response = RestClient.get('https://graph.facebook.com/me', params: { access_token: login_params[:access_token], fields: 'name,email' })
    result = JSON.parse(response.body)
    raise MissingEmail if result["email"].blank?
    result
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
