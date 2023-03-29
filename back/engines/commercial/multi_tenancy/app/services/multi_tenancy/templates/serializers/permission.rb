# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Permission < Base
        ref_attribute :permission_scope
        attributes %i[action permitted_by]
      end
    end
  end
end
