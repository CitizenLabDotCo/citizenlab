# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Membership < Base
        ref_attributes %i[group user]
      end
    end
  end
end
