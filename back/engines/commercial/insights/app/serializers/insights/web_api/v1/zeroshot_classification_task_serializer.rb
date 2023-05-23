# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class ZeroshotClassificationTaskSerializer < ::WebApi::V1::BaseSerializer
        attributes :created_at

        has_many :categories
        has_many :inputs, serializer: ::WebApi::V1::IdeaSerializer do |task, _params|
          task.inputs
        end
      end
    end
  end
end
