# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class PermissionsCustomField < Base
        attributes %i[required ordering]
        ref_attributes %i[custom_field permission]
      end
    end
  end
end
