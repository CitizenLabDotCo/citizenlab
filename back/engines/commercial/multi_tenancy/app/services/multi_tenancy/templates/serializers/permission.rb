# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Permission < Base
        ref_attribute :permission_scope

        attributes %i[
          access_denied_explanation_multiloc
          action
          confirmed_email_expiry
          everyone_tracking_enabled
          global_custom_fields
          permitted_by
          require_confirmed_email
          require_name
          require_password
          require_verification
          user_data_collection
          user_fields_in_form
          verification_expiry
          require_confirmed_phone_number
          confirmed_phone_number_expiry
        ]
      end
    end
  end
end
