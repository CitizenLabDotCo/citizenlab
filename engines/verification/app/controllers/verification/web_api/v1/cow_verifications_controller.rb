module Verification
  class WebApi::V1::CowVerificationsController < VerificationController

    def create
      verification_service = VerificationService.new
      verification = verification_service.verify_now(
        user: current_user,
        method: "cow",
        parameters: {
          run: verification_params[:run],
          id_serial: verification_params[:id_serial]
        }
      )
      authorize verification
      head :created
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