# frozen_string_literal: true

module Events
  class IcsGenerator
    # @param [Event, #to_ary] events one or multiple events
    # @param [String] preferred_locale
    # @return [String] the ics file
    def generate_ics(events, preferred_locale)
      generate_calendar(events, preferred_locale).to_ical
    end

    def generate_calendar(events, preferred_locale)
      cal = empty_calendar

      events = Array.wrap(events)
      events.each do |event|
        add_event_to_calendar(cal, event, preferred_locale)
      end

      cal
    end

    private

    def empty_calendar
      Icalendar::Calendar.new.tap do |cal|
        cal.prodid = 'CitizenLab'
      end
    end

    def add_event_to_calendar(cal, event, preferred_locale)
      cal.event do |e|
        e.dtstart = Icalendar::Values::DateTime.new(event.start_at)
        e.dtend = Icalendar::Values::DateTime.new(event.end_at)
        e.summary = multiloc_service.t(event.title_multiloc, preferred_locale)
        e.description = multiloc_service.t(event.description_multiloc, preferred_locale)
        e.location = full_address(event, preferred_locale)
        # TODO: e.url = event.online_link

        e.geo = [event.location_point.y, event.location_point.x] if event.location_point
      end

      cal
    end

    def full_address(event, preferred_locale)
      address = ''
      address += event.address_1 if event.address_1.present?

      address_details = multiloc_service.t(event.address_2_multiloc, preferred_locale)
      address += "\n(#{address_details})" if address_details.present?

      address.presence
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
