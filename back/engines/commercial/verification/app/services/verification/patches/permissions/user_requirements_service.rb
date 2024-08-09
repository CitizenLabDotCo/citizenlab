# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module UserRequirementsService
        MIN_VERIFICATION_EXPIRY = 30.minutes

        # Verification requirement can now come from either a group or the permitted_by value
        def requires_verification?(permission, user)
          return false if user_allowed_through_other_groups?(permission, user) # if the user meets the requirements of any other group we don't need to ask for verification
          return false unless permission.permitted_by == 'verified' || verification_service.find_verification_group(permission.groups)

          if !permission.verification_expiry.nil? && user.verifications.present?
            # Check requirements for when we require verification again
            expiry_offset = permission.verification_expiry == 0 ? MIN_VERIFICATION_EXPIRY : permission.verification_expiry.days
            last_verification_time = user.verifications.last&.updated_at
            next_verification_time = last_verification_time + expiry_offset
            next_verification_time < Time.now
          else
            !user.verified?
          end
        end

        private

        def base_requirements(permission)
          requirements = super

          if @check_groups_and_verification && permission.verification_enabled?
            requirements[:verification] = true
          end
          requirements
        end

        def mark_satisfied_requirements!(requirements, permission, user)
          super
          return unless requirements[:verification]

          requirements[:verification] = requires_verification?(permission, user)
        end

        # User can be in other groups that are not verification groups and therefore not need to be verified
        def user_allowed_through_other_groups?(permission, user)
          (permission.groups.any? && user.in_any_groups?(permission.groups)) && permission.permitted_by != 'verified'
        end

        def verification_service
          @verification_service ||= VerificationService.new
        end
      end
    end
  end
end
