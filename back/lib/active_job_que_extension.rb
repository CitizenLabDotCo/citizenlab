# frozen_string_literal: true

module ActiveJobQueExtension
  # Raised in place of an exception that is not a StandardError, so that the job goes through Que's
  # regular error handling (see `#_run`). The original exception is available as `cause`.
  class NonStandardError < StandardError
    def initialize(original)
      super("#{original.class}: #{original.message}")
      set_backtrace(original.backtrace)
    end
  end

  # Exceptions that must keep propagating out of a job: they concern the process, not the job.
  UNRECOVERABLE_EXCEPTIONS = [SignalException, SystemExit, NoMemoryError].freeze

  def self.included(base)
    base.class_eval do
      class_attribute :should_retry

      class << self
        # rubocop:disable Style/OptionalBooleanParameter
        def perform_retries(should_retry = true)
          self.should_retry = should_retry
        end
        # rubocop:enable Style/OptionalBooleanParameter
      end
    end
  end

  def handle_error(error)
    self.class.should_retry ? super : expire
  end

  def destroy_in(delay)
    finish
    DeleteQueJobJob.set(wait: delay).perform_later(job_id)
  end

  # For some reason, `Que` freezes the arguments and keyword arguments when the job
  # loaded from the DB. We don't want that (the code base as it is today modify those
  # arguments in place in many places), so we override the `Que::ActiveJob::JobExtensions#perform`
  # method to skip the freezing step.
  def perform(*args)
    args, kwargs = Que.split_out_ruby2_keywords(args)

    Que.internal_log(:active_job_perform, self) do
      { args: args, kwargs: kwargs }
    end

    _run(
      args: que_filter_args(args.map { |a| a.is_a?(Hash) ? a.deep_symbolize_keys : a }),
      kwargs: que_filter_args(kwargs.deep_symbolize_keys),
      reraise_errors: true
    )
  end
  ruby2_keywords(:perform) if respond_to?(:ruby2_keywords, true)

  # Que only rescues StandardError around a job, both in `Que::JobMethods#_run` and in
  # `Que::Worker#work_job`. Anything else raised by a job (NotImplementedError and the other
  # ScriptErrors, SystemStackError, ...) escapes both, terminates the worker thread and, because Que
  # starts its worker threads with `abort_on_exception = true`, the whole `que` process. The job row
  # is left untouched (error_count 0, run_at in the past), so the restarted process picks that very
  # job first and dies again: a crash loop that only ends when someone expires the job by hand, and
  # that kills every other job in flight in the process on each iteration (TAN-8516).
  #
  # Wrap those exceptions in a StandardError and apply the same error handling as
  # `Que::JobMethods#_run`, so the job is retried or expired according to `perform_retries` like
  # any other failure.
  def _run(reraise_errors: false, **)
    super
  rescue Exception => e # rubocop:disable Lint/RescueException
    raise if e.is_a?(StandardError) || UNRECOVERABLE_EXCEPTIONS.any? { |klass| e.is_a?(klass) } || !que_target

    error = NonStandardError.new(e)
    que_target.que_error = error

    run_error_notifier =
      begin
        handle_error(error)
      rescue StandardError => handle_error_error
        Que.notify_error(handle_error_error, que_target.que_attrs)
        true
      end

    Que.notify_error(error, que_target.que_attrs) if run_error_notifier
    retry_in_default_interval unless que_target.que_resolved

    raise error if reraise_errors
  end
end
