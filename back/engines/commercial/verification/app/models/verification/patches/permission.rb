# frozen_string_literal: true

module Verification
  module Patches
    module Permission
      def self.included(base)
        base.class_eval do
          validate :validate_verified_permitted_by
          validate :validate_verification_expiry

          def verification_enabled?
            # Verification can be enabled by permitted_by OR by a verification group
            return true if permitted_by == 'verified'
            return true if groups.any? && VerificationService.new.find_verification_group(groups)

            false
          end

          private

          def validate_verified_permitted_by
            return unless permitted_by == 'verified' && VerificationService.new.first_method_enabled_for_verified_actions.nil?

            errors.add(
              :permitted_by,
              :verified_permitted_by_not_allowed,
              message: 'Verified permitted_by is not allowed because there are no methods enabled for actions.'
            )
          end

          def validate_verification_expiry
            return if verification_expiry.nil?
            return if permitted_by == 'verified' || !verification_expiry_changed?

            errors.add(
              :permitted_by,
              :verification_expiry_cannot_be_set,
              message: 'Verification expiry can only be set for a verified permitted_by.'
            )
          end
        end
      end
    end
  end
end
