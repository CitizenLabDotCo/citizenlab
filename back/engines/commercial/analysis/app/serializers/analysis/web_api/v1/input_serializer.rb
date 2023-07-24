# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class InputSerializer < ::WebApi::V1::BaseSerializer
        set_type :analysis_input

        attributes :title_multiloc, :body_multiloc, :custom_field_values, :published_at, :updated_at, :likes_count, :dislikes_count, :comments_count, :votes_count

        belongs_to :author, serializer: ::WebApi::V1::UserSerializer
      end
    end
  end
end
