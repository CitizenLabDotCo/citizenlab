# frozen_string_literal: true

module MultiTenancy
  module Patches
    module FaviconUploader
      def store_dir
        "uploads/#{model.tenant.id}/favicon/#{model.id}"
      end
    end
  end
end
