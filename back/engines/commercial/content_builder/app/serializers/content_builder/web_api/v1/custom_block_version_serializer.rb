# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      # Everything the host widget needs to render one placed block, in one response.
      #
      # The compiled bundle is left out on purpose: it is served as JavaScript by
      # +custom_block_versions#bundle+ so the browser can import it and cache it. The
      # authored source is left out too — it is of no use to a renderer, and a report
      # can be public.
      #
      # The block's own title and status ride along because they are part of rendering a
      # placed block (the builder labels it, a disabled block renders nothing), and
      # because reading them from a separate block endpoint is what let a version's
      # metadata drift away from the version actually being rendered.
      class CustomBlockVersionSerializer < ::WebApi::V1::BaseSerializer
        set_type :custom_block_version

        attributes :number, :sdk_version, :manifest, :messages, :created_at

        attribute :block_title_multiloc do |version|
          version.custom_block.title_multiloc
        end

        attribute :block_status do |version|
          version.custom_block.status
        end
      end
    end
  end
end
