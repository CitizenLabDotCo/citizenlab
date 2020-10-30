module AdminApi
  class IdeaSerializer < ActiveModel::Serializer
    attributes :id,
      :title_multiloc,
      :body_multiloc,
      :published_at,
      :project_id,
      :created_at,
      :updated_at

    has_many :topics
    belongs_to :author

    class TopicSerializer < ActiveModel::Serializer
      attributes :id
    end

    class UserSerializer < ActiveModel::Serializer
      attributes :id
    end
  end
end
