# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Reaction < Base
        ref_attributes %i[user reactable]
        attribute :mode
      end
    end
  end
end
