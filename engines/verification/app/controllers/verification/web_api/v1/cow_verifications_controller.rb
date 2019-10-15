module Verification
  class WebApi::V1::CowVerificationsController < VerificationController

    # Not all code paths (exceptions) perform an `authorize` call, so we're
    # forced to skip this
    skip_after_action :verify_authorized, only: [:create]

    def create
      verification_service = VerificationService.new
      verification = verification_service.verify_sync(
        user: current_user,
        method_name: "cow",
        parameters: {
          run: verification_params[:run],
          id_serial: verification_params[:id_serial]
        }
      )
      authorize verification
      head :created
    rescue VerificationService::NoMatchError => e
      render json: {errors: {base: [{error: "no_match"}]}}, status: :unprocessable_entity
    rescue VerificationService::InputInvalidError => e
      render json: {errors: {e.message => [{error: "invalid"}]}}, status: :unprocessable_entity
    rescue VerificationService::VerificationTakenError => e
      render json: {errors: {base: [{error: "taken"}]}}, status: :unprocessable_entity
    end

    private

    def verification_params
      params.require(:verification).permit(
        :run,
        :id_serial
      )
    end

    def secure_controller?
      false
    end
  end
end