class TestJob < ApplicationJob
  perform_retries count: 2

  def run
    raise
  end
end
