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

    # Uncomment and write tests if you need it.
    #
    # def record(error_class = StandardError)
    #   yield
    # rescue error_class => e
    #   report(e)
    #   raise
    # end

    # 1. You can see the full list of Sentry options (`extra` and others) here
    # https://github.com/getsentry/sentry-ruby/blob/4.7.2/sentry-ruby/lib/sentry/scope.rb#L78

    # 2. Sentry::Rails (vs simple Sentry) sends Rails integration hints to Sentry
    # https://github.com/getsentry/sentry-ruby/blob/4.7.2/sentry-rails/lib/sentry/rails.rb

    # 3. You may use specific method for controller or add specific controller `extra` fields (e.g. `extra: { params: params }`)
    # https://github.com/getsentry/sentry-ruby/blob/4.7.2/sentry-rails/lib/sentry/rails/controller_methods.rb

    def report_msg(msg, extra: {})
      Sentry::Rails.capture_message(msg, extra: extra) # it sends the backtrace to Sentry.
      # It's considered as an exceptional situation, so printing the entire backtrace to make it visible.
      Rails.logger.error(
        "Reported message: #{msg}\n" + caller.join("\n"),
        extra
      )
    end

    # Avoid passing manually created errors here like `ErrorReporter.report(RuntimeError.new('message')`
    # (though it would work), because it does not contain the backtrace, so it will be harder to debug.
    # Use `ErrorReporter.report_msg('message')` instead.
    def report(error, extra: {})
      Sentry::Rails.capture_exception(error, extra: extra)
      Rails.logger.error(
        "Reported error: #{error.message} (#{error.class})\n" +
        (error.backtrace&.join("\n") || ''),
        extra
      )
    end
  end
end
