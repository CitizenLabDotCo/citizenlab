# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      # Public representation of a custom block. Deliberately never exposes the source or
      # the compiled bundle of a version: the bundle is served by its own endpoint and the
      # source is admin-only (see +CustomBlockVersionSerializer+).
      class CustomBlockSerializer < ::WebApi::V1::BaseSerializer
        set_type :custom_block

        attributes :title_multiloc, :description_multiloc, :status, :created_at, :updated_at

        attribute :current_version do |custom_block|
          version = custom_block.current_version
          version && {
            id: version.id,
            number: version.number,
            manifest: version.manifest,
            messages: version.messages,
            sdk_version: version.sdk_version,
            created_at: version.created_at
          }
        end
      end
    end
  end
end
