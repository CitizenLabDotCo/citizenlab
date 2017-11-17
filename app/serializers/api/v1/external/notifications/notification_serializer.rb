class Api::V1::External::Notifications::NotificationSerializer < ActiveModel::Serializer

  class CustomUserSerializer < ActiveModel::Serializer
    attributes :id, :slug, :first_name, :last_name, :avatar, :locale
    def avatar
      object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end

  class CustomProjectSerializer < ActiveModel::Serializer
    attributes :id, :slug, :title_multiloc, :description_multiloc, :created_at
  end

  class CustomCommentSerializer < ActiveModel::Serializer
    attributes :id, :body_multiloc, :upvotes_count, :downvotes_count, :url, :created_at

    def url ### TODO this should become the comment URL as soos as this is supported
      "#{Tenant.current.base_frontend_uri}/ideas/#{object.idea.slug}"
    end
  end

  class CustomIdeaSerializer < ActiveModel::Serializer
    attributes :id, :slug, :title_multiloc, :body_multiloc, :upvotes_count, :downvotes_count, :url, :created_at
    has_many :topics

    def url
      "#{Tenant.current.base_frontend_uri}/ideas/#{object.slug}"
    end
  end

  class CustomImageSerializer < ActiveModel::Serializer
    attributes :id, :versions, :ordering

    def versions
      object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
    end
  end

  
  attributes :id, :recipient_email
  belongs_to :recipient, serializer: CustomUserSerializer


  def recipient_email
  	object.recipient&.email
  end

  def comment_author
  	object.comment&.author
  end

  def idea_author
    object.idea&.author
  end

  def idea_images
    object.idea&.idea_images
  end

  def idea_topics
  	object.idea&.topics
  end

  def project_images
  	object.project&.project_images
  end

end