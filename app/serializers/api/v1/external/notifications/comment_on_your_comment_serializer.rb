class Api::V1::External::Notifications::CommentOnYourCommentSerializer < Api::V1::External::Notifications::NotificationSerializer
  class CustomCommentSerializer < ActiveModel::Serializer
    attributes :id, :body_multiloc, :upvotes_count, :downvotes_count
    belongs_to :author, serializer: Api::V1::External::Notifications::NotificationSerializer::CustomUserSerializer
  end
  class CustomIdeaSerializer < ActiveModel::Serializer
    attributes :id, :title_multiloc, :body_multiloc, :upvotes_count, :downvotes_count
  end
  class CustomImageSerializer < ActiveModel::Serializer
    attributes :id, :versions, :ordering

    def versions
      object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end

  belongs_to :comment, serializer: CustomCommentSerializer
  belongs_to :idea, serializer: CustomIdeaSerializer
  has_many :idea_images, serializer: CustomImageSerializer

  def idea_images
    object.idea&.idea_images
  end

end