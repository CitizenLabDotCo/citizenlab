# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class StaticPagesTopic < Base
        ref_attributes %i[static_page topic]
      end
    end
  end
end
