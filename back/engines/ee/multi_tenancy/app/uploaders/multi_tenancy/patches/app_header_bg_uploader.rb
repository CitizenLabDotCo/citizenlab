# frozen_string_literal: true

module MultiTenancy
  module Patches
    module AppHeaderBgUploader
      def store_dir
        "uploads/#{model.tenant.id}/header-background/#{model.id}"
      end
    end
  end
end
