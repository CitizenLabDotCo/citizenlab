# frozen_string_literal: true

# After https://github.com/nsarno/knock/blob/master/app/controllers/knock/auth_token_controller.rb.
module AuthToken
  class AuthTokenController < ActionController::API
    include ActionController::Cookies

    before_action :authenticate, except: [:destroy]

    rescue_from ActiveRecord::RecordNotFound, with: :not_found

    def create
      token = auth_token.token

      # Use response.set_cookie, not `cookies[:cl2_jwt] =`, to bypass middleware
      # dependency to ensure reliable HttpOnly flag setting in API-only Rails apps
      response.set_cookie(:cl2_jwt, {
        value: token,
        httponly: true,
        secure: true,
        same_site: :lax,
        expires: 1.day.from_now,
        path: '/'
      })

      render json: auth_token, status: :created
    end

    def destroy
      puts 'Destroy action in AuthTokenController called'
      # Clear the JWT cookie by setting it to expire immediately
      response.set_cookie(:cl2_jwt, {
        value: '',
        expires: 1.second.ago,
        path: '/',
        httponly: true,
        secure: true,
        same_site: :lax
      })

      head :no_content
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
