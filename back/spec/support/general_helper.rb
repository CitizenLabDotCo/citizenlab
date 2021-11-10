require 'timeout'

module GeneralHelper
  # https://gist.github.com/jnicklas/d8da686061f0a59ffdf7#gistcomment-2900179
  def wait_until(time, &_block)
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
end
