# frozen_string_literal: true

module AdminApi
  class AdminApiController < ActionController::API
    before_action :authenticate_request
    around_action :switch_tenant

    rescue_from ActiveRecord::RecordNotFound, with: :send_not_found
    rescue_from ClErrors::TransactionError, with: :transaction_error

    def authenticate_request
      unless request.headers['Authorization'] == ENV.fetch('ADMIN_API_TOKEN')
        render json: { error: 'Not Authorized' }, status: 401
        false
      end
    end

    def switch_tenant(&block)
      tenant_id = params[:tenant_id] || request.headers['tenant']
      tenant_id ? Tenant.find(tenant_id).switch(&block) : yield
    end

    def send_not_found(error = nil)
      if error.nil?
        head 404, 'content_type' => 'text/plain'
      else
        render json: error, status: 404
      end
    end

    def transaction_error(exception)
      render json: { errors: { base: [{ error: exception.error_key, message: exception.message }] } }, status: exception.code
    end
  end
end
