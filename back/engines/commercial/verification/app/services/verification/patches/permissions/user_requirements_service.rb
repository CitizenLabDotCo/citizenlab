# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module UserRequirementsService
        def requires_verification?(permission, user)
          return false unless permission.permitted_by == 'groups'
          return false if user.in_any_groups? permission.groups # if the user meets the requirements of any other group we don't need to ask for verification
          return false unless verification_service.find_verification_group(permission.groups)

          !user.verified?
        end

        private

        def base_requirements(permission)
          requirements = super

          if @check_groups && permission.permitted_by == 'groups' && verification_service.find_verification_group(permission.groups)
            requirements[:special][:verification] = 'require'
          end
          requirements
        end

        def mark_satisfied_requirements!(requirements, permission, user)
          super
          return unless requirements[:special][:verification] == 'require'

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
