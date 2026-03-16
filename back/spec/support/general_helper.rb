# frozen_string_literal: true

require 'timeout'

module GeneralHelper
  # https://gist.github.com/jnicklas/d8da686061f0a59ffdf7#gistcomment-2900179
  def wait_until(time, &)
    Timeout.timeout(time) do
      sleep(0.01) until (value = yield)
      value
    end
  end

  # return example: [[:capture_exception, ["param"], nil]]
  def messages_received(object)
    proxy = RSpec::Mocks.space.proxy_for(object)
    proxy.instance_variable_get(:@messages_received)
  end

  def iso8601_datetime_regex
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})/
  end
  alias iso8601_regex iso8601_datetime_regex
  alias time_regex iso8601_datetime_regex

  # Replaces the timezone of a timestamp without shifting the time values.
  def override_timezone(timestamp, timezone)
    timezone.local_to_utc(timestamp).in_time_zone(timezone)
  end

  def uuid_regex
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/ # After https://stackoverflow.com/a/6640851/3585671
  end
end
