module Moderation
  class ModerationStatus < ApplicationRecord
    MODERATION_STATUSES = %w(unread read)

    belongs_to :moderatable, polymorphic: true

    validates :moderatable, presence: true
    validates :status, inclusion: { in: MODERATION_STATUSES }

  end
end
