# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class CustomBlocksController < ApplicationController
        skip_before_action :authenticate_user, only: %i[show]

        def index
          custom_blocks = policy_scope(CustomBlock).order(created_at: :desc)
          custom_blocks = custom_blocks.where(status: params[:status]) if CustomBlock::STATUSES.include?(params[:status])

          render json: WebApi::V1::CustomBlockSerializer.new(
            custom_blocks,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def show
          render json: WebApi::V1::CustomBlockSerializer.new(
            custom_block,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def create
          @custom_block = CustomBlock.new params_for_create
          @custom_block.created_by = current_user
          authorize @custom_block

          if @custom_block.save
            render json: WebApi::V1::CustomBlockSerializer.new(
              @custom_block,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :created
          else
            render json: { errors: @custom_block.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          custom_block.assign_attributes params_for_update

          if custom_block.save
            render json: WebApi::V1::CustomBlockSerializer.new(
              custom_block,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :ok
          else
            render json: { errors: custom_block.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          custom_block.destroy
          if custom_block.destroyed?
            head :ok
          else
            render json: { errors: custom_block.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def custom_block
          @custom_block ||= CustomBlock.find(params[:id]).tap { |block| authorize block }
        end

        def params_for_create
          params.require(:custom_block).permit(title_multiloc: {})
        end

        def params_for_update
          params.require(:custom_block).permit(:status, { title_multiloc: {}, description_multiloc: {} })
        end
      end
    end
  end
end
