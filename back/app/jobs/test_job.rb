class TestJob < ApplicationJob
  perform_retries max: 2

  def run
    raise
  end
end
