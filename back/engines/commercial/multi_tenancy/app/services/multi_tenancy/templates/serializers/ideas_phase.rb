# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class IdeasPhase < Base
        ref_attributes %i[idea phase]
        attributes %i[baskets_count votes_count]
      end
    end
  end
end
