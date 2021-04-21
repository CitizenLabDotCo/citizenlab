module UserConfirmation
  module WebApi
    module V1
      class ConfirmationCodesController < ApplicationController
        skip_after_action :verify_authorized

        def create
          result = SendNewConfirmationCode.call(user: current_user)

          if result.success?
            head :ok
          else
            render json: { errors: result.errors.details }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
