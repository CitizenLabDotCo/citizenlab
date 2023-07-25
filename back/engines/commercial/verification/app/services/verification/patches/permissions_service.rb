# frozen_string_literal: true

module Verification
  module Patches
    module PermissionsService
      def denied_when_permitted_by_groups?(permission, user)
        denied_reason = super

        if denied_reason == :not_in_group && !user.verified? && VerificationService.new.find_verification_group(permission.groups)
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
        return unless permission.permitted_by == 'groups' && VerificationService.new.find_verification_group(permission.groups)

        if user.verified?
          requirements[:special][:verification] = 'satisfied'
        elsif user.in_any_groups? permission.groups
          requirements[:special][:verification] = 'dont_ask'
        end
      end
    end
  end
end
