# frozen_string_literal: true

# Prepended to ActiveJob::Base (not ApplicationJob) so that ActionMailer::MailDeliveryJob
# is covered too.
#
# Not `ActiveSupport.on_load(:active_job)` (what Rails/ActiveSupportOnLoad wants):
# ActiveJob::Base is already loaded when this initializer runs, so the hook would fire
# immediately — before the autoloader can resolve ActiveJobRelatedGidsExtension (from
# lib/) — and boot fails with NameError. `to_prepare` runs after boot (and on each app
# reload, where prepending again is a no-op), when autoloading is available.
Rails.application.config.to_prepare do
  # rubocop:disable Rails/ActiveSupportOnLoad
  ActiveJob::Base.prepend(ActiveJobRelatedGidsExtension)
  # rubocop:enable Rails/ActiveSupportOnLoad
end
