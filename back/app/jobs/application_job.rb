# frozen_string_literal: true

class ApplicationJob < ActiveJob::Base
  include Bullet::ActiveJob if Rails.env.development?
  include Que::ActiveJob::JobExtensions
  include ActiveJobQueExtension

  perform_retries true

  # Otherwise the default priority would be 100, which is the lowest priority.
  self.priority = 50

  def que_job
    @que_job ||= QueJob.by_job_id!(job_id)
  end

  def maximum_retry_count
    que_target.class.resolve_que_setting(:maximum_retry_count)
  end

  class RetryInError < StandardError
    attr_reader :retry_in

    # @example
    #    raise RetryInError.new('Custom message', retry_in: 5.minutes)
    #
    # @param message [String, nil] Custom error message (optional)
    # @param retry_in [ActiveSupport::Duration, nil] Duration to wait before retrying the job
    def initialize(message = nil, retry_in = nil)
      raise ArgumentError, 'retry_in must be present' if retry_in.nil?

      super(message)
      @retry_in = retry_in
    end
  end
end
