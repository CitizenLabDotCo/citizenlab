# frozen_string_literal: true

module Verification
  module Patches
    module Permission
      def verification_enabled?
        return true if permitted_by == 'verified'
        return true if groups.any? && VerificationService.new.find_verification_group(groups)
        super
      end
    end
  end
end
