# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class BasketsIdea < Base
        ref_attributes %i[basket idea]
        attributes %i[votes]
      end
    end
  end
end
