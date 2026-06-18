# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Permission < Base
        ref_attribute :permission_scope

        attributes %i[
          access_denied_explanation_multiloc
          action
          everyone_tracking_enabled
          global_custom_fields
          user_data_collection
          user_fields_in_form
          verification_expiry
        ]

        # Permitted by 'verified' is only allowed if at least one verification method is turned on in settings, so should fallback to 'users' when written to templates
        attribute(:permitted_by) { |permission| permission.permitted_by == 'verified' ? 'users' : permission.permitted_by }
      end
    end
  end
end
