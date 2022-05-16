# frozen_string_literal: true

SEGMENT_CLIENT = if ENV['SEGMENT_WRITE_KEY']
  SimpleSegment::Client.new(write_key: ENV['SEGMENT_WRITE_KEY'], logger: Rails.logger)
end
