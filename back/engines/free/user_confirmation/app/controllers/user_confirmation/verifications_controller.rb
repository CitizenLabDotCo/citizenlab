module UserConfirmation
  class VerificationsController < ApplicationController
    def create
      result = CheckConfirmationCode.call(user: current_user, code: code)

      if result.success?
        head :ok
      else
        render json: { error: result.error_code }, status: :unprocessable_entity
      end
    end

    private

    def confirmation_params
      params.permit(:code)
    end
  end
end
