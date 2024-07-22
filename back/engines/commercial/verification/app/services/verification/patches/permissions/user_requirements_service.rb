# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module UserRequirementsService
        # Verification requirement can now come from either a group or a permissions_field
        def requires_verification?(permission, user)
          return false unless %w[groups custom].include?(permission.permitted_by)

          return false if permission.groups.any? && user.in_any_groups?(permission.groups) && !verify_by_field?(permission) # if the user meets the requirements of any other group we don't need to ask for verification
          return false unless verification_service.find_verification_group(permission.groups) || verify_by_field?(permission)

          !user.verified?
        end

        private

        def base_requirements(permission)
          requirements = super

          if (@check_groups && permission.permitted_by == 'groups' && verification_service.find_verification_group(permission.groups)) ||
            verify_by_field?(permission)
            requirements[:special][:verification] = 'require'
          end
          requirements
        end

        def mark_satisfied_requirements!(requirements, permission, user)
          super
          return unless requirements[:special][:verification] == 'require'

          if user.verified?
            requirements[:special][:verification] = 'satisfied'
          elsif (permission.groups.any? && user.in_any_groups?(permission.groups)) && !verify_by_field?(permission)
            requirements[:special][:verification] = 'dont_ask'
          end
        end

        def verify_by_field?(permission)
          permission.permitted_by == 'custom' && permission.permissions_fields.find_by(field_type: 'verification')&.required
        end

        def verification_service
          @verification_service ||= VerificationService.new
        end
      end
    end
  end
end
