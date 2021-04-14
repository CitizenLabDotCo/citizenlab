module UserConfirmation
  module WebApi
    module V1
      class ConfirmationsController < ApplicationController
        skip_after_action :verify_authorized

        def create
          result = CheckConfirmationCode.call(user: current_user, code: confirmation_params[:code])

          if result.success?
            head :ok
          else
            render json: { error: result.error }, status: :unprocessable_entity
          end
        end

        private

        def secure_controller?
          false
        end

        def confirmation_params
          params.permit(:code)
        end
      end
    end
  end
end
