# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class CustomBlockVersionsController < ApplicationController
        skip_before_action :authenticate_user, only: %i[bundle]
        skip_after_action :verify_policy_scoped, only: %i[index] # The custom block is authorized instead.

        def index
          authorize custom_block, :versions_index?
          versions = custom_block.versions.order(number: :desc)

          render json: WebApi::V1::CustomBlockVersionSerializer.new(
            versions,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def create
          authorize custom_block, :versions_create?
          version = custom_block.versions.new params_for_create

          if version.save
            custom_block.update!(current_version: version)
            render json: WebApi::V1::CustomBlockVersionSerializer.new(
              version,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :created
          else
            render json: { errors: version.errors.details }, status: :unprocessable_entity
          end
        end

        # Serves the compiled bundle as JavaScript, for the front-end to import at runtime.
        # Versions are immutable, so the response can be cached indefinitely.
        def bundle
          authorize custom_block, :bundle?
          version = custom_block.versions.find_by!(number: params[:number])

          response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
          render plain: version.bundle, content_type: 'text/javascript'
        end

        private

        def custom_block
          @custom_block ||= CustomBlock.find(params[:custom_block_id])
        end

        def params_for_create
          params.require(:version).permit(:source, :bundle, :ai_session_id, { manifest: {}, messages: {} })
        end
      end
    end
  end
end
