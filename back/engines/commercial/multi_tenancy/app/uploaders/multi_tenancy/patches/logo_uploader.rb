# frozen_string_literal: true

module MultiTenancy
  module Patches
    module LogoUploader
      def store_dir
        "uploads/#{model.tenant.id}/logo/#{model.id}"
      end
    end
  end
end
