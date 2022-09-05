# frozen_string_literal: true

class ApplicationJob < ActiveJob::Base
  include Bullet::ActiveJob if Rails.env.development?
  include Que::ActiveJob::JobExtensions
  include ActiveJobQueExtension

  perform_retries true

  # Otherwise the default priority would be 100, which is the lowest priority.
  self.priority = 50
end
