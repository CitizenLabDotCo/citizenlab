# frozen_string_literal: true

module Verification
  module Patches
    module Permissions
      module UserRequirementsService
        MIN_VERIFICATION_EXPIRY = 30.minutes

        # Verification requirement can now come from either a group or the "verified" permitted_by value
        def requires_verification?(permission, user)
          if permission.permitted_by == 'verified'
            # Only check requirements for when we require verification again if permitted_by is 'verified'
            if !permission.verification_expiry.nil? && user.verifications.present?
              expiry_offset = permission.verification_expiry == 0 ? MIN_VERIFICATION_EXPIRY : permission.verification_expiry.days
              last_verification_time = user.verifications.last&.updated_at
              next_verification_time = last_verification_time + expiry_offset
              return next_verification_time < Time.now
            end
          else
            # Verification via groups
            return false if user_allowed_through_other_groups?(permission, user) # if the user meets the requirements of any other group we don't need to ask for verification
            return false unless verification_service.find_verification_group(permission.groups)
          end

          !user.verified?
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

          if user.verified?
            if permission.permitted_by == 'verified'
              requirements[:authentication][:missing_user_attributes] = if user.email.present? && user.confirmation_required?
                ['confirmation']
              else
                []
              end
            end

            # Remove custom fields that are locked - we should never ask them to be filled in the flow - even if they are returned empty
            locked_fields = verification_service.locked_custom_fields(user)

            requirements[:custom_fields]&.each_key do |key|
              requirements[:custom_fields].delete(key) if locked_fields.include?(key.to_sym)
            end
          end

          return unless requirements[:verification]

          requirements[:verification] = requires_verification?(permission, user)
        end

        # User can be in other groups that are not verification groups and therefore not need to be verified
        def user_allowed_through_other_groups?(permission, user)
          return false unless permission.groups.any?

          # Remove the verification group from the list of groups
          groups = permission.groups.to_a
          groups.delete(verification_service.find_verification_group(groups))
          return false unless groups.any?

          user.in_any_groups?(groups)
        end

        def verification_service
          @verification_service ||= VerificationService.new
        end
      end
    end
  end
end
