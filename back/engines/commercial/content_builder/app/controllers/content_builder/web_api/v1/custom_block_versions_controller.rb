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

        # Fills in the compiled bundle of a version the background composer stored
        # `pending`. The backend has no JavaScript toolchain, so the browser compiles
        # the source when the report is first opened and posts the result here.
        #
        # Only a pending version accepts this: the authored source never changes, and a
        # version that already compiled must not be swapped for different code.
        def compile
          authorize custom_block, :versions_create?
          version = custom_block.versions.find_by!(number: params[:number])

          unless version.pending?
            return render json: { errors: { base: [{ error: 'already_compiled' }] } }, status: :conflict
          end

          if version.update(params_for_compile)
            render json: WebApi::V1::CustomBlockVersionSerializer.new(
              version,
              params: jsonapi_serializer_params
            ).serializable_hash
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
          params.require(:version).permit(:source, :bundle, :compile_state, :ai_session_id, { manifest: {}, messages: {} })
        end

        def params_for_compile
          permitted = params.require(:version).permit(:bundle, :compile_state)
          # A caller may only move a pending version to a settled state.
          permitted[:compile_state] = 'compiled' unless permitted[:compile_state] == 'failed'
          permitted
        end
      end
    end
  end
end
