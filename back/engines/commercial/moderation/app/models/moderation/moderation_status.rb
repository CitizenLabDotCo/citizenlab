# == Schema Information
#
# Table name: moderation_moderation_statuses
#
#  id               :uuid             not null, primary key
#  moderatable_id   :uuid
#  moderatable_type :string
#  status           :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  moderation_statuses_moderatable  (moderatable_type,moderatable_id) UNIQUE
#
module Moderation
  class ModerationStatus < ApplicationRecord
    MODERATION_STATUSES = %w(unread read)

    belongs_to :moderatable, polymorphic: true

    validates :moderatable, presence: true
    validates :status, inclusion: { in: MODERATION_STATUSES }

  end
end
