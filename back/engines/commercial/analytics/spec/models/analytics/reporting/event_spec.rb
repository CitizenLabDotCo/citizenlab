# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Event do
  it 'exposes the event with its project, dates and registrations' do
    event = create(:event, :with_location, maximum_attendees: 30)
    create_list(:event_attendance, 2, event: event)
    row = described_class.find(event.id)

    expect(row.project_id).to eq event.project_id
    expect(row.title).to eq 'Info session'
    expect(row.start_at).to eq event.start_at
    expect(row.end_at).to eq event.end_at
    expect(row.location).to eq 'Atomiumsquare 1, 1020 Brussels, Belgium'
    expect(row.attendees_count).to eq 2
    expect(row.maximum_attendees).to eq 30
  end

  it 'falls back to the free-text location when there is no address' do
    event = create(:event, location_multiloc: { 'en' => 'Town hall, room 2' })

    expect(described_class.find(event.id).location).to eq 'Town hall, room 2'
  end

  it 'exposes online and external registration links, and NULL when blank' do
    online = create(:event, :with_online_link, using_url: 'https://tickets.example.com/info')
    offline = create(:event, online_link: '', using_url: '')

    expect(described_class.find(online.id)).to have_attributes(
      online_link: online.online_link,
      external_registration_url: 'https://tickets.example.com/info'
    )
    expect(described_class.find(offline.id)).to have_attributes(online_link: nil, external_registration_url: nil)
  end

  it 'joins the attendance rows of reporting_contributions' do
    event = create(:event)
    attendance = create(:event_attendance, event: event)

    expect(
      Analytics::Reporting::Contribution.where(type: 'attendance', parent_id: event.id).pluck(:id)
    ).to eq [attendance.id]
  end
end
