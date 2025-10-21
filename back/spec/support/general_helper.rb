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

  def time_regex
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
  end

  def uuid_regex
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/ # After https://stackoverflow.com/a/6640851/3585671
  end
end
