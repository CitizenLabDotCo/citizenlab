class AdminApi::AdminApiController < ActionController::API
  before_action :authenticate_request

  def authenticate_request
    unless request.headers["Authorization"] == ENV.fetch("ADMIN_API_TOKEN")
      render json: { error: 'Not Authorized' }, status: 401
      false
    end
  end
end