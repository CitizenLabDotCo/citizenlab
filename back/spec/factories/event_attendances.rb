# frozen_string_literal: true

FactoryBot.define do
  factory :event_attendance, class: 'Events::Attendance' do
    event
    association :attendee, factory: :user
  end
end
