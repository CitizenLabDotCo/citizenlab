# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class PermissionsField < Base
        attributes %i[
          required
          field_type
          config
          enabled
          ordering
        ]

        ref_attributes %i[custom_field permission]
      end
    end
  end
end
