# frozen_string_literal: true

class RemoveUsersFromSegmentJob < ApplicationJob
  queue_as :default

  def run(user_ids)
    # We create a 'DELETE' regulation even if the feature is not enabled,
    # in case it was used in the past.
    SegmentRegulationsClient.new.delete(user_ids)
  rescue SegmentRegulationsClient::MissingAuthorizationTokenError
    # Silence missing token errors if data is not sent to Segment.
    raise if defined?(SEGMENT_CLIENT) && SEGMENT_CLIENT.is_a?(SimpleSegment::Client)
  end
end
