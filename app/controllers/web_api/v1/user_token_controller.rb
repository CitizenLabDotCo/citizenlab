class WebApi::V1::UserTokenController < Knock::AuthTokenController
  # Turn off CSRF
  # skip_before_action :verify_authenticity_token
end
