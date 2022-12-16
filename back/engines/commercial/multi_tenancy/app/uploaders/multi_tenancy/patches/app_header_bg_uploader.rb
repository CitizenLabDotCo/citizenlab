# frozen_string_literal: true

module MultiTenancy
  module Patches
    # @deprecated Use {HeaderBgUploader} in the main app, which uses {AppConfiguration} instead of the deprecated {Tenant} model
    # and therefore doesn't need this patch anymore.
    module AppHeaderBgUploader
      def store_dir
        "uploads/#{model.tenant.id}/header-background/#{model.id}"
      end
    end
  end
end
