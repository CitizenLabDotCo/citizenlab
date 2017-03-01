class ApplicationController < ActionController::API
  include Pundit
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index
end
