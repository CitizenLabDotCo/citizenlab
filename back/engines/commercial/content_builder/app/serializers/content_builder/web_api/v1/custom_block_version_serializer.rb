# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      # Only served by the admin-only version endpoints. The compiled bundle is left out
      # on purpose: it is served as JavaScript by +custom_block_versions#bundle+.
      class CustomBlockVersionSerializer < ::WebApi::V1::BaseSerializer
        set_type :custom_block_version

        attributes :number, :source, :manifest, :messages, :sdk_version, :created_at
      end
    end
  end
end
