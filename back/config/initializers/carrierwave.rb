# frozen_string_literal: true

require 'carrierwave/file_base64/adapter'

CarrierWave.configure { |config| config.enable_processing = false } if Rails.env.test? || Rails.env.cucumber?

# Adds the mount_base64_file_uploader class method to ActiveRecord.
ActiveSupport.on_load :active_record do
  ActiveRecord::Base.extend Carrierwave::FileBase64::Adapter
end
