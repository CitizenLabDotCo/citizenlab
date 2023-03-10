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
    end
  end
end
