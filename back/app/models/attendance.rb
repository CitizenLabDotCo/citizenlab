# == Schema Information
#
# Table name: attendances
#
#  id         :uuid             not null, primary key
#  event_id   :uuid             not null
#  user_id    :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_attendances_on_event_id  (event_id)
#  index_attendances_on_user_id   (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#  fk_rails_...  (user_id => users.id)
#
class Attendance < ApplicationRecord
  belongs_to :event
  counter_culture :event

  belongs_to :user

  validates :event, :user, presence: true
end
