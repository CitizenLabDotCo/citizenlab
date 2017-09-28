Analytics = nil

if ENV.fetch("SEGMENT_WRITE_KEY")
  Analytics = SimpleSegment::Client.new({
    write_key: ENV.fetch("SEGMENT_WRITE_KEY")
  })
end