# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      # Serves one pinned version of a custom block: the metadata the host widget needs
      # to render it, and the compiled bundle it imports.
      #
      # A layout pins +{blockId, version}+, so these are the only two reads a placed
      # block performs. There is deliberately no "give me the current version" route:
      # resolving a block against anything other than its pin would change reports that
      # were already written and reviewed.
      class CustomBlockVersionsController < ApplicationController
        skip_before_action :authenticate_user, only: %i[show bundle]

        def show
          authorize custom_block, :show?

          render json: WebApi::V1::CustomBlockVersionSerializer.new(
            version,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        # Served as JavaScript, imported at runtime by the block loader. Versions are
        # immutable, so the response can be cached indefinitely.
        def bundle
          authorize custom_block, :bundle?

          response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
          render plain: version.bundle, content_type: 'text/javascript'
        end

        private

        def custom_block
          @custom_block ||= CustomBlock.find(params[:custom_block_id])
        end

        def version
          @version ||= custom_block.versions.find_by!(number: params[:number])
        end
      end
    end
  end
end
