# frozen_string_literal: true

module AdminApi
  class IdeaSerializer < ActiveModel::Serializer
    attributes :id,
      :title_multiloc,
      :body_multiloc,
      :slug,
      :href,
      :published_at,
      :submitted_at,
      :project_id,
      :likes_count,
      :dislikes_count,
      :comments_count,
      :created_at,
      :updated_at

    def href
      Frontend::UrlService.new.model_to_url(object)
    end

    has_many :input_topics
    has_many :idea_images
    belongs_to :author

    class InputTopicSerializer < ActiveModel::Serializer
      attributes :id
    end

    class UserSerializer < ActiveModel::Serializer
      attributes :id
    end

    class IdeaImageSerializer < ActiveModel::Serializer
      attributes :id, :versions

      def versions
        object.image.versions.to_h { |k, v| [k.to_s, v.url] }
      end
    end
  end
end
