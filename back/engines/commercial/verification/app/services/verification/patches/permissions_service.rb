# frozen_string_literal: true

module Verification
  module Patches
    module PermissionsService
      def denied_when_permitted_by_groups?(permission, user)
        denied_reason = super

        if denied_reason == :not_permitted && !user.verified? && VerificationService.new.find_verification_group(permission.groups)
          return :not_verified
        end

        denied_reason
      end

      private

      def base_requirements(permission)
        requirements = super

        if VerificationService.new.find_verification_group(permission.groups)
          requirements[:special][:verification] = 'require'
        end
        requirements
      end

      def mark_satisfied_requirements!(requirements, permission, user)
        super
        return unless permission.permitted_by == 'groups' && user.verified? && VerificationService.new.find_verification_group(permission.groups)

        requirements[:special][:verification] = 'satisfied'
      end
    end
  end
end
