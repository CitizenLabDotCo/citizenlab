require 'active_support/concern'

module Moderatable
  extend ActiveSupport::Concern

  included do
    has_one :moderation_status

    scope :moderation_status, (Proc.new do |status|
      joins(:moderation_status).where(moderation_statuses: {status: status})
    end)
  end

  class_methods do
  end

  def moderation_status
    ModerationStatus.where(moderatable: self).first&.status || 'unread'
  end

end