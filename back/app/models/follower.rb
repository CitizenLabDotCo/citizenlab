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
#  index_followers_followable_type_id_user_id  (followable_id,followable_type,user_id) UNIQUE
#  index_followers_on_user_id                  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Follower < ApplicationRecord
  belongs_to :user
  belongs_to :followable, polymorphic: true

  validates :user, :followable, presence: true
  # The index is there and should be correct, but we still get an offense. Perhaps because of the followable_type
  # ruubocop:disable Rails/UniqueValidationWithoutIndex
  validates :user_id, uniqueness: { scope: %i[followable_type followable_id] }
  # ruubocop:enable Rails/UniqueValidationWithoutIndex

  counter_culture :followable, column_name: :followers_count
end
