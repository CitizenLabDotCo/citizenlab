# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class InitiativesTopic
        include Core

        ref_attributes %i[initiative topic]
      end
    end
  end
end
