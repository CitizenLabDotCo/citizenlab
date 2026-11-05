# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class StaticPagesGlobalTopic < Base
        ref_attributes %i[static_page global_topic]
      end
    end
  end
end
