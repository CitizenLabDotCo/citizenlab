# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class GroupsPermission < Base
        ref_attributes %i[group permission]
      end
    end
  end
end
