# frozen_string_literal: true

module AdminApi
  class IdeaSerializer < ActiveModel::Serializer
    attributes :id,
      :title_multiloc,
      :body_multiloc,
      :published_at,
      :submitted_at,
      :project_id,
      :created_at,
      :updated_at

    has_many :input_topics
    belongs_to :author

    class InputTopicSerializer < ActiveModel::Serializer
      attributes :id
    end

    class UserSerializer < ActiveModel::Serializer
      attributes :id
    end
  end
end
