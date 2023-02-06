# frozen_string_literal: true

# Use this file to easily define all of your cron jobs.
# Learn more: http://github.com/javan/whenever

every 6.hours do
  runner 'Analytics::ImportLatestMatomoDataJob.perform_for_all_tenants'
end

# every :sunday, at: '12pm' do
every 1.minute do
  runner 'MyAmazingJob.run'
end
