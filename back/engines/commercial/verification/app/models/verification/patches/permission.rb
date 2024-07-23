# frozen_string_literal: true

module Verification
  module Patches
    module Permission
      def self.included(base)
        base.class_eval do
          def verification_enabled?
            return true if permitted_by == 'verified'
            return true if groups.any? && VerificationService.new.find_verification_group(groups)
            false
          end
        end
      end
    end
  end
end
