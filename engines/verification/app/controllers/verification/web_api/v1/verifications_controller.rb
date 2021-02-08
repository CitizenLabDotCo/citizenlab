module Verification
  module WebApi
    module V1
      class VerificationsController < VerificationController

        # Not all code paths (exceptions) perform an `authorize` call, so we're
        # forced to skip this
        skip_after_action :verify_authorized, only: [:create]

        before_action :set_verification_method

        def create
          verification = @ver_ser.verify_sync(
            user: current_user,
            method_name: @verification_method.name,
            verification_parameters: verification_params.to_h.symbolize_keys
          )
          authorize verification
          head :created
        rescue VerificationService::NoMatchError => e
          render json: {errors: {base: [{error: "no_match"}]}}, status: :unprocessable_entity
        rescue VerificationService::NotEntitledError => e
          render json: {errors: {base: [{error: "not_entitled"}]}}, status: :unprocessable_entity
        rescue VerificationService::ParameterInvalidError => e
          render json: {errors: {e.message => [{error: "invalid"}]}}, status: :unprocessable_entity
        rescue VerificationService::VerificationTakenError => e
          render json: {errors: {base: [{error: "taken"}]}}, status: :unprocessable_entity
        end

        private

        def verification_params
          params
            .require(:verification)
            .permit(*@verification_method.verification_parameters)
        end

        def set_verification_method
          @ver_ser = VerificationService.new
          @verification_method = @ver_ser.method_by_name(params[:method_name])

          unless @verification_method
            raise RuntimeError.new("Unknown verification method #{params[:method_name]}")
          end

          unless AppConfiguration.instance.has_feature?('verification')
            raise Pundit::NotAuthorizedError.new
          end

          unless @ver_ser.active_methods(AppConfiguration.instance).include?(@verification_method)
            raise Pundit::NotAuthorizedError.new
          end
        end

        def secure_controller?
          false
        end
      end
    end
  end
end