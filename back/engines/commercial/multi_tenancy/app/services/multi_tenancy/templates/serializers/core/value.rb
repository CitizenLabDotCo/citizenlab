# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Core
        class Value
          def initialize(value)
            @value = value
          end

          def dereference(_context)
            @value
          end
        end
      end
    end
  end
end

