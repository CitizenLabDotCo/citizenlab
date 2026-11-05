# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class IdeasInputTopic
        include Core

        ref_attributes %i[idea input_topic]
      end
    end
  end
end
