# frozen_string_literal: true

module FlagInappropriateContent
  module WebApi
    module V1
      class InappropriateContentFlagsController < ApplicationController
        before_action :set_flag

        def show
          render json: FlagInappropriateContent::WebApi::V1::InappropriateContentFlagSerializer.new(@flag, params: jsonapi_serializer_params).serializable_hash
        end

        def mark_as_deleted
          @flag.deleted_at = Time.now
          if @flag.save
            SideFxInappropriateContentFlagService.new.after_mark_as_deleted @flag, current_user
            head :accepted
          else
            render json: { errors: @flag.errors.details }, status: :unprocessable_entity
          end
        end

        def mark_as_flagged
          @flag.deleted_at = nil
          if @flag.save
            SideFxInappropriateContentFlagService.new.after_mark_as_flagged @flag, current_user
            head :ok
          else
            render json: { errors: @flag.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_flag
          @flag = InappropriateContentFlag.find params[:id]
          authorize @flag
        end
      end
    end
  end
end
