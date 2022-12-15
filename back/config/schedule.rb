# frozen_string_literal: true

# Use this file to easily define all of your cron jobs.
# Learn more: http://github.com/javan/whenever

every 6.hours do
  runner 'Analytics::ImportLatestMatomoDataJob.perform_for_all_tenants'
end
