# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class IdeasTopic
        include Core

        ref_attributes %i[idea topic]
      end
    end
  end
end
