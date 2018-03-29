Analytics = if ENV.fetch("SEGMENT_WRITE_KEY")
  SimpleSegment::Client.new({
    write_key: ENV.fetch("SEGMENT_WRITE_KEY"),
    logger: Rails.logger
  })
else
  nil
end