# frozen_string_literal: true

require 'icalendar/tzinfo'

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
        cal.prodid = 'GoVocal'
      end
    end

    def add_event_to_calendar(cal, event, preferred_locale)
      timezone = AppConfiguration.timezone
      start_time = event.start_at.in_time_zone(timezone)
      end_time = event.end_at.in_time_zone(timezone)

      # Since we don't include the timezone definition (VTIMEZONE) in the calendar, we
      # should normally use global timezone identifiers that can be looked up by the
      # calendar app in the timezone registry. According to the ICS specification,
      # global identifiers use `/` as a prefix, for example, `/America/New_York` for
      # `America/New_York`. However, both Apple Calendar and Outlook Calendar do not
      # recognize the timezone when it is prefixed with `/`. On the other hand, all the
      # calendar apps we tested (Apple Calendar, Outlook, Google Calendar, and Proton
      # Calendar) seem to work fine with the timezone identifier without the `/` prefix.
      # Therefore, we have decided to use the timezone identifier without the `/` prefix,
      # even though it deviates from the ICS specification.
      tzid = timezone.tzinfo.identifier
      ical_timezone = timezone.tzinfo.ical_timezone start_time
      cal.add_timezone ical_timezone

      cal.event do |e|
        e.dtstart = Icalendar::Values::DateTime.new(start_time, tzid: tzid)
        e.dtend = Icalendar::Values::DateTime.new(end_time, tzid: tzid)

        e.summary = multiloc_service.t(event.title_multiloc, preferred_locale)
        e.description = event_description(event, preferred_locale)
        e.location = full_address(event, preferred_locale)

        # The interpretation of the URL property seems to differ widely depending on its
        # value and the calendar app. Most of them will just ignore the property if they
        # don't recognize a well-known video conferencing service in the URL.
        e.url = event.online_link

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

    def event_description(event, preferred_locale)
      tenant_locales = AppConfiguration.instance.settings('core', 'locales')
      locale = tenant_locales.include?(preferred_locale) ? preferred_locale : tenant_locales.first

      event_details = I18n.with_locale(locale) { I18n.t('ics_calendar_event.event_details') }
      event_url = Frontend::UrlService.new.model_to_url(event, locale: Locale.new(locale))

      "#{event_details}: #{event_url}"
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
