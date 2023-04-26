# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class GroupsProject < Base
        ref_attributes %i[group project]
      end
    end
  end
end
