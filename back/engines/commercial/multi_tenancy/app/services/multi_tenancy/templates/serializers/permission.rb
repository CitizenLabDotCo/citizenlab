# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Permission < Base
        ref_attribute :permission_scope
        attributes %i[action global_custom_fields]

        # Permitted by 'verified' is only allowed if verification turned on in settings, so should fallback to 'users' when written to templates
        attribute(:permitted_by) { |permission| permission.permitted_by == 'verified' ? 'users' : permission.permitted_by }
      end
    end
  end
end
