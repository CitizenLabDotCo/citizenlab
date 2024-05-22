# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module UserRequirementsService
        private

        def base_requirements(permission)
          requirements = super

          if verification_service.find_verification_group(permission.groups)
            requirements[:special][:verification] = 'require'
          end
          requirements
        end

        def mark_satisfied_requirements!(requirements, permission, user)
          super
          return unless permission.permitted_by == 'groups' && verification_service.find_verification_group(permission.groups)

          if user.verified?
            requirements[:special][:verification] = 'satisfied'
          elsif user.in_any_groups? permission.groups
            requirements[:special][:verification] = 'dont_ask'
          end
        end

        def verification_service
          @verification_service ||= VerificationService.new
        end
      end
    end
  end
end
