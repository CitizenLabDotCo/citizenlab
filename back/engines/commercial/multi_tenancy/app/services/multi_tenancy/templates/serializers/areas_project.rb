# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class AreasProject
        include Core

        ref_attributes %i[area project]
      end
    end
  end
end
