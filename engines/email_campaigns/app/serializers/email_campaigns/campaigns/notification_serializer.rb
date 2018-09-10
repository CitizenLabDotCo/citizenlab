module EmailCampaigns
  class Campaigns::NotificationSerializer < ActiveModel::Serializer

    class CustomUserSerializer < ActiveModel::Serializer
      attributes :id, :slug, :first_name, :last_name, :avatar, :locale

      def avatar
        object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
      end
    end

    class CustomProjectSerializer < ActiveModel::Serializer
      attributes :id, :slug, :title_multiloc, :description_multiloc, :url, :created_at, :header_bg, :ideas_count

      def created_at
        object.created_at.iso8601
      end

      def url
        FrontendService.new.model_to_url object
      end

      def header_bg
        object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
      end
    end

    class CustomCommentSerializer < ActiveModel::Serializer
      attributes :id, :body_multiloc, :upvotes_count, :downvotes_count, :url, :created_at, :author_name, :author_avatar

      def created_at
        object.created_at.iso8601
      end


      def url
        FrontendService.new.model_to_url object
      end

      def author_avatar
        object.author&.avatar && object.author.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
      end
    end

    class CustomIdeaSerializer < ActiveModel::Serializer
      attributes :id, :slug, :title_multiloc, :body_multiloc, :upvotes_count, :downvotes_count, :url, :published_at, :created_at, :author_name

      def published_at
        object.created_at.iso8601
      end

      def created_at
        object.published_at.iso8601
      end

      def url
        FrontendService.new.model_to_url object
      end
    end

    class CustomImageSerializer < ActiveModel::Serializer
      attributes :id, :versions, :ordering

      def versions
        object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
      end
    end

    class CustomSpamReportSerializer < ActiveModel::Serializer
      attributes :id, :reason_code, :other_reason, :reported_at, :url

      def reported_at
        object.reported_at.iso8601
      end

      def url
        FrontendService.new.model_to_url object.spam_reportable
      end
    end

    class CustomInviteSerializer < ActiveModel::Serializer
     attributes :id, :invite_text, :accepted_at, :activate_invite_url

      def accepted_at
        object.accepted_at.iso8601
      end

      def activate_invite_url
        FrontendService.new.invite_url object.token, locale: object.invitee.locale
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
end