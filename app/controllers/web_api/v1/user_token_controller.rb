class WebApi::V1::UserTokenController < Knock::AuthTokenController
  # Turn off CSRF (after https://github.com/nsarno/knock/issues/208#issuecomment-373022274)
  skip_before_action :verify_authenticity_token
end
