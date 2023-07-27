# frozen_string_literal: true

# == Schema Information
#
# Table name: events_attendances
#
#  id          :uuid             not null, primary key
#  attendee_id :uuid             not null
#  event_id    :uuid             not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_events_attendances_on_attendee_id               (attendee_id)
#  index_events_attendances_on_attendee_id_and_event_id  (attendee_id,event_id) UNIQUE
#  index_events_attendances_on_event_id                  (event_id)
#
# Foreign Keys
#
#  fk_rails_...  (attendee_id => users.id)
#  fk_rails_...  (event_id => events.id)
#
module Events
  class Attendance < Base
    belongs_to :event
    belongs_to :attendee, class_name: 'User', foreign_key: 'attendee_id'

    validates :attendee, uniqueness: { scope: :event_id }
  end
end
