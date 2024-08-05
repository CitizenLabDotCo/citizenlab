# frozen_string_literal: true

module Verification
  module Patches
    module Permission
      def self.included(base)
        base.class_eval do
          validate :allow_verified_permitted_by

          def verification_enabled?
            return true if permitted_by == 'verified'
            return true if groups.any? && VerificationService.new.find_verification_group(groups)

            false
          end

          def allow_verified_permitted_by
            return unless permitted_by == 'verified' && VerificationService.new.first_method_allowed_on_action.nil?

            errors.add(
              :permitted_by,
              :verified_permitted_by_not_allowed,
              message: 'Verified permitted_by is not allowed because there are no methods enabled for actions.'
            )
          end
        end
      end
    end
  end
end
