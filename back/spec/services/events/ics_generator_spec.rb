# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Events::IcsGenerator do
  subject(:ics_generator) { described_class.new }

  describe '.generate_ics' do
    before do
      app_config = AppConfiguration.instance
      settings = app_config.settings
      settings['core']['timezone'] = 'America/New_York'
      app_config.update!(settings: settings)
    end

    # This test serves as a regression test. The generated ICS file was verified and
    # manually tested with a calendar app. If this test were to become too brittle,
    # we can instead check for the presence of specific chosen substrings. For example:
    #   expect(ics_string).to include('PRODID:CitizenLab')
    #   expect(ics_string).to include('GEO:50.8465574798584;4.351710319519043')
    it 'serializes a single event to ics' do
      event = create(:event, :with_location)
      ics_string = ics_generator.generate_ics(event, 'en')

      expected_ics = <<~ICS.gsub("\n", "\r\n")
        BEGIN:VCALENDAR
        VERSION:2.0
        PRODID:GoVocal
        CALSCALE:GREGORIAN
        BEGIN:VTIMEZONE
        TZID:America/New_York
        BEGIN:DAYLIGHT
        DTSTART:20170312T030000
        TZOFFSETFROM:-0500
        TZOFFSETTO:-0400
        RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3
        TZNAME:EDT
        END:DAYLIGHT
        BEGIN:STANDARD
        DTSTART:20171105T010000
        TZOFFSETFROM:-0400
        TZOFFSETTO:-0500
        RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11
        TZNAME:EST
        END:STANDARD
        END:VTIMEZONE
        BEGIN:VEVENT
        DTSTAMP:%DTSTAMP_PLACEHOLDER%
        UID:%UID_PLACEHOLDER%
        DTSTART;TZID=America/New_York:20170501T160000
        DTEND;TZID=America/New_York:20170501T180000
        DESCRIPTION:Event details: http://example.org/en/events/#{event.id[..-18]}
         #{event.id[-17..]}
        GEO:50.8465574798584;4.351710319519043
        LOCATION:Atomiumsquare 1\\, 1020 Brussels\\, Belgium\\n(Sphere 1)
        SUMMARY:Info session
        END:VEVENT
        END:VCALENDAR
      ICS

      # example of uid: 6c5789cc-1ab4-47fb-b9da-c1a6baa0edbd
      expected_ics = Regexp
        .escape(expected_ics)
        .gsub('%DTSTAMP_PLACEHOLDER%', '[0-9]{8}T[0-9]{6}Z')
        .gsub('%UID_PLACEHOLDER%', '[a-z0-9\-]+')
      expected_ics = Regexp.new(expected_ics)

      expect(ics_string).to match(expected_ics)
    end

    it 'serializes multiple events to ics' do
      events = create_list(:event, 2, :with_location)
      ics_string = ics_generator.generate_ics(events, 'en')
      expect(ics_string.scan('BEGIN:VEVENT').count).to eq(2)
    end

    it 'includes the online link in the ics file if present' do
      event = create(:event, :with_online_link)
      ics_string = ics_generator.generate_ics(event, 'en')
      expect(ics_string).to include("URL;VALUE=URI:#{event.online_link}")
    end

    it 'falls back to another locale if the preferred locale is not available' do
      event = create(
        :event,
        :with_location,
        title_multiloc: { 'en' => 'title' },
        description_multiloc: { 'en' => 'description' },
        address_2_multiloc: { 'en' => 'address 2' }
      )

      ics_string = ics_generator.generate_ics(event, 'fa-KE')

      expect(ics_string).to include("SUMMARY:#{event.title_multiloc['en']}")
      expect(ics_string).to include(event.address_2_multiloc['en'])
    end
  end
end
