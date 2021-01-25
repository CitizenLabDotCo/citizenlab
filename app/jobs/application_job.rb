class ApplicationJob < ActiveJob::Base
  include Bullet::ActiveJob if Rails.env.development?
  include Que::ActiveJob::JobExtensions
  include ActiveJobQueExtension

  perform_retries true
end
