# frozen_string_literal: true

# == Schema Information
#
# Table name: followers
#
#  id              :uuid             not null, primary key
#  followable_type :string           not null
#  followable_id   :uuid             not null
#  user_id         :uuid             not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_followers_followable_type_id_user_id            (followable_id,followable_type,user_id) UNIQUE
#  index_followers_on_followable                         (followable_type,followable_id)
#  index_followers_on_followable_id_and_followable_type  (followable_id,followable_type)
#  index_followers_on_user_id                            (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Follower < ApplicationRecord
  FOLLOWABLE_TYPES = %w[Project ProjectFolders::Folder Idea GlobalTopic Area]

  belongs_to :user
  belongs_to :followable, polymorphic: true

  validates :user, :followable, presence: true
  validates :user_id, uniqueness: { scope: %i[followable_type followable_id] }
  validates :followable_type, inclusion: { in: FOLLOWABLE_TYPES }

  counter_culture :followable
  counter_culture :user, column_name: :followings_count
end
