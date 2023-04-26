# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class AreasInitiative
        include Core

        ref_attributes %i[area initiative]
      end
    end
  end
end
