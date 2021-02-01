class ApplicationJob < ActiveJob::Base
  include Bullet::ActiveJob if Rails.env.development?
end
