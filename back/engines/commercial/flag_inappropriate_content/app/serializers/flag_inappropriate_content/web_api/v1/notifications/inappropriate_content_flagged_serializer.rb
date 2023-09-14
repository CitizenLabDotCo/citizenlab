# frozen_string_literal: true

module FlagInappropriateContent
  class WebApi::V1::Notifications::InappropriateContentFlaggedSerializer < ::WebApi::V1::Notifications::NotificationSerializer
    attribute :flaggable_path do |object|
      "/#{Frontend::UrlService.new.model_to_path(object.inappropriate_content_flag.flaggable)}"
    end
  end
end
