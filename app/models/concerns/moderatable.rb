require 'active_support/concern'

module Moderatable
  extend ActiveSupport::Concern

  MODERATION_STATUSES = %w(unread read)

  included do
    validates :moderation_status, presence: true, inclusion: {in: MODERATION_STATUSES}

    before_validation :set_moderation_status, on: :create
  end

  class_methods do
  end

  
  private

  def set_moderation_status
    self.moderation_status ||= 'unread'
  end

end