# frozen_string_literal: true

# Prepended to ActiveJob::Base (not ApplicationJob) so that ActionMailer::MailDeliveryJob
# is covered too. `to_prepare` because the module is autoloaded; prepending is idempotent
# across reloads.
Rails.application.config.to_prepare do
  ActiveJob::Base.prepend(ActiveJobRelatedGidsExtension)
end
