# frozen_string_literal: true

# == Schema Information
#
# Table name: memberships
#
#  id         :uuid             not null, primary key
#  group_id   :uuid
#  user_id    :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_memberships_on_group_id              (group_id)
#  index_memberships_on_group_id_and_user_id  (group_id,user_id) UNIQUE
#  index_memberships_on_user_id               (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (group_id => groups.id)
#  fk_rails_...  (user_id => users.id)
#
class Membership < ApplicationRecord
  belongs_to :group
  counter_culture(
    :group,
    column_name: proc { |membership| membership&.user&.active? ? 'memberships_count' : nil },
    touch: true
  )
  belongs_to :user

  validates :group, :user, presence: true
  validates :user, uniqueness: { scope: :group }
end
