# frozen_string_literal: true

module Insights
  module WebApi
    module V1
      class InputSerializer < ::WebApi::V1::BaseSerializer
        belongs_to :source, record_type: :idea, serializer: ::WebApi::V1::IdeaSerializer do |idea, _params|
          idea
        end

        # [TODO] optimize DB requests
        has_many :categories do |idea, _params|
          ::Insights::CategoryAssignment.where(input: idea, approved: true)
                                        .map(&:category)
        end

        # [TODO] optimize DB requests
        has_many :suggested_categories, record_type: :category, serializer: CategorySerializer do |idea, _params|
          ::Insights::CategoryAssignment.where(input: idea, approved: false)
                                        .map(&:category)
        end
      end
    end
  end
end
