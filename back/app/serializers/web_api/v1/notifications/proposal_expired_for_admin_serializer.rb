# frozen_string_literal: true

class WebApi::V1::Notifications::ProposalExpiredForAdminSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :post_title_multiloc do |object|
    object.idea&.title_multiloc
  end

  attribute :post_slug do |object|
    object.idea&.slug
  end
end
