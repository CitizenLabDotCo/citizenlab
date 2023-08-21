# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Follower < Base
        ref_attributes %i[followable user]
      end
    end
  end
end
