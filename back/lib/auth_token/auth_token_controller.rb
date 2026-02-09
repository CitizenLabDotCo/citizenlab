# frozen_string_literal: true

# After https://github.com/nsarno/knock/blob/master/app/controllers/knock/auth_token_controller.rb.
module AuthToken
  class AuthTokenController < ActionController::API
    before_action :authenticate

    rescue_from ActiveRecord::RecordNotFound, with: :not_found

    def create
      render json: auth_token, status: :created
    end

    private

    def authenticate
      block_because_requires_confirmation = entity.try(:confirmation_required?)

      return if entity.present? &&
                entity.authenticate(auth_params[secret_param]) &&
                !block_because_requires_confirmation

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
