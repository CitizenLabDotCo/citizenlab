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

          if @check_groups && permission.verification_enabled?
            requirements[:require_verification] = true
          end
          requirements
        end

        def mark_satisfied_requirements!(requirements, permission, user)
          super
          return unless requirements[:require_verification]

          # TODO: JS - does the front-end care about the difference between dont_ask and satisfied that we had before?
          if user.verified?
            requirements[:require_verification] = false
          elsif user_allowed_through_other_groups?(permission, user)
            requirements[:require_verification] = false
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
