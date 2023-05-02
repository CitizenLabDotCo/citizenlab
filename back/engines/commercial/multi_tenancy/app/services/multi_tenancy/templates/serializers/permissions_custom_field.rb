# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class PermissionsCustomField < Base
        attribute :required
        ref_attributes %i[custom_field permission]
      end
    end
  end
end
