# Simplified (not compatible) version of Rails ErrorReporter
# https://github.com/rails/rails/pull/43625/files
class ErrorReporter
  class << self
    # Report any unhandled exception, and swallow it.
    #
    #  ErrorReporter.handle do
    #    1 + '1'
    #  end
    #
    def handle(error_class = StandardError)
      yield
    rescue error_class => e
      report(e)
      nil
    end

    # Uncomment if you need it.
    #
    # def record(error_class = StandardError)
    #   yield
    # rescue error_class => e
    #   report(e)
    #   raise
    # end

    def report(error, extra_fields = {})
      Sentry.capture_exception(error, extra: extra_fields)
      Rails.logger.error(
        "Reported error: #{error.message} (#{error.class})\n" +
        (error.backtrace&.join("\n") || ''),
        extra_fields
      )
    end
  end
end
