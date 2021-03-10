# frozen_string_literal: true

if Rails.env.development?
  Rails.autoloaders.logger = Rails.logger
  Rails.autoloaders.log!
end
