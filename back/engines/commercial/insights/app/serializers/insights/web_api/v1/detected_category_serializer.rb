# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class DetectedCategorySerializer < ::WebApi::V1::BaseSerializer
        attributes :name
        belongs_to :view, serializer: ViewSerializer, record_type: :view
      end
    end
  end
end
