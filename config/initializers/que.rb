Que::Job.tap do |config|
  config.retry_interval      = proc { |count| (count**6) + 15 + (rand(30) * (count + 1)) }
  config.maximum_retry_count = 9
end
