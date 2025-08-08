# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class InputSerializer < ::WebApi::V1::BaseSerializer
        set_type :analysis_input

        attributes :title_multiloc, :body_multiloc, :custom_field_values, :published_at, :updated_at, :likes_count, :dislikes_count, :comments_count, :votes_count, :location_description

        belongs_to :author, serializer: ::Analysis::WebApi::V1::AnalysisUserSerializer
        belongs_to :idea, serializer: ::WebApi::V1::IdeaSerializer do |input|
          input
        end
      end
    end
  end
end
