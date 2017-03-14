class ApplicationController < ActionController::API
  include Knock::Authenticable
  include Pundit

  before_action :authenticate_user, if: :secure_controller?
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  def send_success(data=nil, status=200)
    render json: data, status: status
  end

  def send_error(error=nil, status=400)
    render json: error, status: status
  end

  # all controllers are secured by default
  def secure_controller?
    true
  end
end
