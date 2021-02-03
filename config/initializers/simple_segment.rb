SEGMENT_CLIENT = ENV["SEGMENT_WRITE_KEY"] ?
    SimpleSegment::Client.new(write_key: ENV["SEGMENT_WRITE_KEY"], logger: Rails.logger) : nil

