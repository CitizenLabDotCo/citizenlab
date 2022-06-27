# frozen_string_literal: true

module MultiTenancy
  module Patches
    # Used specifically for homepage header background image uploader, which uses the historical
    # AWS s3 bucket locations for the header background image.
    module AppHeaderBgUploader
      def store_dir
        app_config_id = AppConfiguration.first.id
        "uploads/#{app_config_id}/header-background/#{app_config_id}"
      end
    end
  end
end
