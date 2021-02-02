SEGMENT_CLIENT =
  SimpleSegment::Client.new({
    write_key: ENV["SEGMENT_WRITE_KEY"],
    logger: Rails.logger }
  ) if ENV["SEGMENT_WRITE_KEY"]


