# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module UserRequirementsService
        # Verification requirement can now come from either a group or the permitted_by value
        def requires_verification?(permission, user)
          return false if user_allowed_through_other_groups?(permission, user) # if the user meets the requirements of any other group we don't need to ask for verification
          return false unless verification_service.find_verification_group(permission.groups) || permission.permitted_by == 'verified'

          !user.verified?
        end

        private

        def base_requirements(permission)
          requirements = super

          # TODO: JS - does check groups need to only work with group based verification?
          if @check_groups && permission.verification_enabled?
            requirements[:verification] = true
          end
          requirements
        end

        def mark_satisfied_requirements!(requirements, permission, user)
          super

          requirements[:authentication][:missing_user_attributes] = [] if permission.permitted_by == 'verified' && user.verified?
          return unless requirements[:verification]

          if user.verified? || user_allowed_through_other_groups?(permission, user)
            requirements[:verification] = false
          end
        end

        # User can be in other groups that are not verification groups and therefore not need to be verified
        def user_allowed_through_other_groups?(permission, user)
          (permission.groups.any? && user.in_any_groups?(permission.groups)) && !permission.permitted_by != 'verified'
        end

        def verification_service
          @verification_service ||= VerificationService.new
        end
      end
    end
  end
end
