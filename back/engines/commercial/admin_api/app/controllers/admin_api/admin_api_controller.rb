# frozen_string_literal: true

module AdminApi
  class AdminApiController < ActionController::API
    before_action :authenticate_request
    around_action :switch_tenant

    rescue_from ApiError, with: :render_api_error
    rescue_from ActiveRecord::RecordNotFound, with: :send_not_found

    def authenticate_request
      return if request.headers['Authorization'] == ENV.fetch('ADMIN_API_TOKEN')

      render json: { error: 'Not Authorized' }, status: :unauthorized
      false
    end

    def switch_tenant(&)
      tenant_id = params[:tenant_id] || request.headers['tenant']
      tenant_id ? Tenant.find(tenant_id).switch(&) : yield
    end

    def send_not_found(error = nil)
      if error.nil?
        head :not_found, 'content_type' => 'text/plain'
      else
        render json: error, status: :not_found
      end
    end

    def render_api_error(exception)
      render json: exception.payload, status: exception.status
    end
  end
end
