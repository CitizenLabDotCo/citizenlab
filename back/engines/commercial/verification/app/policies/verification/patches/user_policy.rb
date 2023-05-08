# frozen_string_literal: true

module Verification
  module Patches
    module UserPolicy
      def permitted_attributes
        locked_attributes = verification_service.locked_attributes(record)
        super - locked_attributes
      end

      def allowed_custom_fields
        super.where.not(key: locked_custom_fields)
      end

      def locked_custom_fields
        verification_service.locked_custom_fields(record)
      end

      private

      def verification_service
        @verification_service ||= VerificationService.new
      end
    end
  end
end
