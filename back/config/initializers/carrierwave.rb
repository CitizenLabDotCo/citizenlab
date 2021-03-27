# frozen_string_literal: true

require 'carrierwave/file_base64/adapter'

CarrierWave.configure { |config| config.enable_processing = false } if Rails.env.test? || Rails.env.cucumber?

ActiveSupport.on_load :active_record do
  # Adds the mount_base64_file_uploader class method to ActiveRecord.
  ActiveRecord::Base.extend Carrierwave::FileBase64::Adapter
end
