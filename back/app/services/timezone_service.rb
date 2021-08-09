class TimezoneService

  def has_dst? tz
    !!tz.tzinfo.current_period.local_ends_at
  end

  def display_timezone tz
    utc_part = "UTC#{ActiveSupport::TimeZone.seconds_to_utc_offset(tz.utc_offset, false)}"
    "#{utc_part}#{has_dst?(tz) ? ' (DST)' : ''} - #{tz.name}"
  end

end