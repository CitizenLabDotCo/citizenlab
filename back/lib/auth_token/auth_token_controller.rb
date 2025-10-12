# frozen_string_literal: true

# After https://github.com/nsarno/knock/blob/master/app/controllers/knock/auth_token_controller.rb.
module AuthToken
  class AuthTokenController < ActionController::API
    include ActionController::Cookies

    before_action :authenticate

    rescue_from ActiveRecord::RecordNotFound, with: :not_found

    def create
      token = auth_token.token

      response.set_cookie(:cl2_jwt, {
        value: token,
        httponly: true,
        secure: true,
        same_site: :lax,
        expires: 1.day.from_now,
        path: '/'
      })

      # Log what Rails is sending vs what the browser receives
      Rails.logger.info "=== STAGING COOKIE DEBUG ==="
      Rails.logger.info "Rails env: #{Rails.env}"
      Rails.logger.info "Rails Set-Cookie header: #{response.headers['Set-Cookie']}"
      Rails.logger.info "Full response headers: #{response.headers.to_h}"
      Rails.logger.info "=========================="

      render json: auth_token, status: :created
    end

    private

    def authenticate
      return if entity.present? && entity.authenticate(auth_params[secret_param])

      raise ActiveRecord::RecordNotFound
    end

    def auth_token
      if entity.respond_to? :to_token_payload
        AuthToken.new payload: entity.to_token_payload
      else
        AuthToken.new payload: { sub: entity.id }
      end
    end

    def entity
      @entity ||=
        if entity_class.respond_to? :from_token_request
          entity_class.from_token_request request
        else
          entity_class.find_by id_param => auth_params[id_param]
        end
    end

    def entity_class
      entity_name.constantize
    end

    def entity_name
      self.class.name.scan(/\w+/).last.split('TokenController').first
    end

    def auth_params
      params.require(:auth).permit id_param, secret_param, *extra_params
    end

    def id_param
      :email
    end

    def secret_param
      :password
    end

    def extra_params
      []
    end

    def not_found
      head :not_found
    end
  end
end
