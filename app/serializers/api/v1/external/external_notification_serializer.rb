class Api::V1::External::ExternalNotificationSerializer < ActiveModel::Serializer
  class CustomUserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :avatar
    def avatar
      object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end
  class CustomCommentSerializer < ActiveModel::Serializer
    attributes :id, :body_multiloc, :upvotes_count, :downvotes_count
    # belongs_to :author, serializer: Api::V1::External::ExternalNotificationSerializer::CustomUserSerializer
    # belongs_to :parent, serializer: Api::V1::External::ExternalNotificationSerializer::CustomCommentSerializer
  end
  class CustomIdeaSerializer < ActiveModel::Serializer
    attributes :id, :title_multiloc, :body_multiloc, :upvotes_count, :downvotes_count
    # belongs_to :author, serializer: Api::V1::External::ExternalNotificationSerializer::CustomUserSerializer
    
  end
  class CustomProjectSerializer < ActiveModel::Serializer
    attributes :id, :title_multiloc, :description_multiloc
    # has_many :project_images, serializer: Api::V1::ImageSerializer
  end
  class CustomImageSerializer < ActiveModel::Serializer
    attributes :id, :versions, :ordering

    def versions
      object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end
  belongs_to :recipient, serializer: CustomUserSerializer
  belongs_to :user, serializer: CustomUserSerializer
  belongs_to :comment, serializer: CustomCommentSerializer
  belongs_to :idea, serializer: CustomIdeaSerializer
  has_many :idea_images, serializer: CustomImageSerializer
  belongs_to :project, serializer: CustomProjectSerializer

  def idea_images
    object.idea&.idea_images
  end

end