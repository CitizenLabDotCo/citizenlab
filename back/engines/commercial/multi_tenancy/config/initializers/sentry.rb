# frozen_string_literal: true

# This initializer file is used to configure Sentry in our multitenancy
# context. Sentry is not unique to this engine, but just not configured in
# detail on the open-source version

Sentry.init do |config|
  # We don't set the DSN here but pass it using the ENV variable SENTRY_DSN

  config.breadcrumbs_logger = %i[active_support_logger http_logger]

  # How many requests should be traced. For now, to limit performance impact,
  # start with 10%
  config.traces_sample_rate = 0.1

  # We want to log every error in background jobs because the jobs are not transparent for
  # the user and it's harder to find bugs there.
  Que::Job # make sure it will raise error if we change background processing library
  config.excluded_exceptions = [] if $PROGRAM_NAME.include?('que')
  # Client reports are supported by Sentry 21.9.0 and above.
  # At the moment, we use 21.6.3, so we disable it to avoid confusion and logs pollution.
  # https://develop.sentry.dev/sdk/client-reports/
  config.send_client_reports = false
end

Sentry.set_tags(cluster: CL2_CLUSTER)
