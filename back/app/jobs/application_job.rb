class ApplicationJob < ActiveJob::Base
  include Bullet::ActiveJob if Rails.env.development?
  include Que::ActiveJob::JobExtensions
  include ActiveJobQueExtension

  perform_retries true

  def handle_error(error)
    super
    message = "#{error.class.name}: \"#{error}\". Retry count: #{error_count} (max: #{max_retries})."
    Raven.capture_exception(message, tags: { type: 'Job', tenant: Apartment::Tenant.current })
  end
end
