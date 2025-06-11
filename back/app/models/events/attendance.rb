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
#  index_events_attendances_on_created_at                (created_at)
#  index_events_attendances_on_event_id                  (event_id)
#  index_events_attendances_on_updated_at                (updated_at)
#
# Foreign Keys
#
#  fk_rails_...  (attendee_id => users.id)
#  fk_rails_...  (event_id => events.id)
#
module Events
  class Attendance < Base
    belongs_to :event
    belongs_to :attendee, class_name: 'User'

    validates :attendee, uniqueness: {
      scope: :event_id,
      message: 'is already registered to this event' # rubocop:disable Rails/I18nLocaleTexts
    }

    validate :maximum_attendees_not_reached

    counter_culture :event, column_name: 'attendees_count'

    def maximum_attendees_not_reached
      return if event.nil?

      if event.maximum_attendees.present? && event.attendees_count >= event.maximum_attendees
        errors.add(:base, 'Maximum number of attendees reached')
      end
    end
  end
end

Idea.include(SmartGroups::Concerns::ValueReferenceable)
