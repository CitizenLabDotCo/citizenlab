module EmailCampaigns
  class Campaigns::NotificationSerializer < ::WebApi::V1::Fast::BaseSerializer

    class CustomUserSerializer < ::WebApi::V1::Fast::BaseSerializer
      attributes :slug, :first_name, :last_name, :locale

      attribute :avatar do |object|
        object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
      end
    end

    class CustomProjectSerializer < ::WebApi::V1::Fast::BaseSerializer
      attributes :slug, :title_multiloc, :description_multiloc, :ideas_count

      attribute :created_at do |object|
        object.created_at.iso8601
      end

      attribute :url do |object|
        Frontend::UrlService.new.model_to_url object
      end

      attribute :header_bg do |object|
        object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
      end
    end

    class CustomPhaseSerializer < ::WebApi::V1::Fast::BaseSerializer
      attributes :title_multiloc, :description_multiloc

      attribute :start_at do |object|
        object.start_at.iso8601
      end

      attribute :end_at do |object|
        object.start_at.iso8601
      end

      attribute :url do |object|
        Frontend::UrlService.new.model_to_url object
      end
    end

    class CustomOfficialFeedbackSerializer < ::WebApi::V1::Fast::BaseSerializer
      attributes :body_multiloc, :author_multiloc

      attribute :created_at do |object|
        object.created_at.iso8601
      end

      attribute :url do |object|
        Frontend::UrlService.new.model_to_url object
      end
    end

    class CustomCommentSerializer < ::WebApi::V1::Fast::BaseSerializer
      attributes :body_multiloc, :upvotes_count, :downvotes_count, :author_name

      attribute :created_at do |object|
        object.created_at.iso8601
      end

      attribute :url do |object|
        Frontend::UrlService.new.model_to_url object
      end

      attribute :author_avatar do |object|
        object.author&.avatar && object.author.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
      end
    end

    class CustomIdeaSerializer < ::WebApi::V1::Fast::BaseSerializer
      attributes :slug, :title_multiloc, :body_multiloc, :upvotes_count, :downvotes_count, :author_name

      attribute :published_at do |object|
        object.published_at.iso8601
      end

      attribute :created_at do |object|
        object.created_at.iso8601
      end

      attribute :url do |object|
        Frontend::UrlService.new.model_to_url object
      end
    end

    class CustomImageSerializer < ::WebApi::V1::Fast::BaseSerializer
      attribute :ordering

      attribute :versions do |object|
        object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
      end
    end

    class CustomSpamReportSerializer < ::WebApi::V1::Fast::BaseSerializer
      attributes :reason_code, :other_reason

      attribute :reported_at do |object|
        object.reported_at.iso8601
      end

      attribute :url do |object|
        Frontend::UrlService.new.model_to_url object.spam_reportable
      end
    end

    class CustomInviteSerializer < ::WebApi::V1::Fast::BaseSerializer
      attribute :invite_text

      attribute :accepted_at do |object|
        object.accepted_at.iso8601
      end

      attribute :activate_invite_url do |object|
        Frontend::UrlService.new.invite_url object.token, locale: object.invitee.locale
      end
    end


    attribute :recipient_email do |object|
      object.recipient&.email
    end

    belongs_to :recipient, record_type: :user, serializer: CustomUserSerializer
  end
end