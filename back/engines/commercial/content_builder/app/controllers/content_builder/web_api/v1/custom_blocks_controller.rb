# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      # The blocks an admin can place by hand from the builder toolbox.
      #
      # Blocks are written by the report generation loop, never through the API, so
      # listing is the only collection action: the toolbox needs to know what exists and
      # which version a new placement should pin.
      class CustomBlocksController < ::ApplicationController
        def index
          blocks = policy_scope(CustomBlock)
            .where(status: 'published')
            .order(created_at: :desc)
            .to_a
          # Only the columns the serializer reads. A version's source and bundle are
          # the bulk of its row, and a block gains a version every time it is rewritten.
          ActiveRecord::Associations::Preloader.new(
            records: blocks,
            associations: :versions,
            scope: CustomBlockVersion.select(:id, :custom_block_id, :number, :manifest)
          ).call

          render json: CustomBlockSerializer.new(blocks, params: jsonapi_serializer_params).serializable_hash
        end
      end
    end
  end
end
