# This initializer file is used to configure Sentry in our multitenancy
# context. Sentry is not unique to this engine, but just not configured in
# detail on the open-source version

Sentry.init do |config|

  # We don't set the DSN here but pass it using the ENV variable SENTRY_DSN

  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  # How many requests should be traced. For now, to limit performance impact,
  # start with 10%
  config.traces_sample_rate = 0.1
end

Sentry.set_tags(cluster: CL2_CLUSTER)
