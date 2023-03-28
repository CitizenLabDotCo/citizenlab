# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Area < Base
        attributes %i[description_multiloc title_multiloc ordering]
      end
    end
  end
end
