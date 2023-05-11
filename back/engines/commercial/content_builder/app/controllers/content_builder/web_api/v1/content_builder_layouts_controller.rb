# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class ContentBuilderLayoutsController < ApplicationController
        before_action :project_exists
        before_action :set_layout, only: %i[show destroy]
        skip_before_action :authenticate_user, only: %i[show]

        def show
          render json: WebApi::V1::LayoutSerializer.new(
            @layout,
            params: jsonapi_serializer_params
          ).serializable_hash.to_json
        end

        def upsert
          @layout = Layout.find_by(
            content_buildable_id: params[:project_id],
            content_buildable_type: Project.name,
            code: params[:code]
          )
          @layout ? update : create
        end

        def destroy
          side_fx_service.before_destroy(@layout, current_user)
          layout = @layout.destroy
          if layout.destroyed?
            side_fx_service.after_destroy(layout, current_user)
            head :ok
          else
            head :internal_server_error
          end
        end

        private

        def project_exists
          Project.find params[:project_id]
        end

        def set_layout
          @layout = Layout.find_by!(
            content_buildable_id: params[:project_id],
            content_buildable_type: Project.name,
            code: params[:code]
          )
          authorize @layout
        end

        def side_fx_service
          @side_fx_service ||= ::ContentBuilder::SideFxLayoutService.new
        end

        def update
          set_layout
          @layout.assign_attributes params_for_update
          side_fx_service.before_update @layout, current_user
          if @layout.save
            side_fx_service.after_update @layout, current_user
            render json: WebApi::V1::LayoutSerializer.new(
              @layout,
              params: jsonapi_serializer_params
            ).serializable_hash.to_json, status: :ok
          else
            render json: { errors: @layout.errors.details }, status: :unprocessable_entity
          end
        end

        def create
          @layout = Layout.new params_for_create
          authorize @layout
          side_fx_service.before_create @layout, current_user
          if @layout.save
            side_fx_service.after_create @layout, current_user
            render json: WebApi::V1::LayoutSerializer.new(
              @layout,
              params: jsonapi_serializer_params
            ).serializable_hash.to_json, status: :created
          else
            render json: { errors: @layout.errors.details }, status: :unprocessable_entity
          end
        end

        def params_for_upsert
          params.require(
            :content_builder_layout
          ).permit(
            :enabled,
            {
              craftjs_jsonmultiloc: CL2_SUPPORTED_LOCALES.map { |locale| { locale => {} } }
            }
          )
        end

        def params_for_create
          layout_params = params_for_upsert
          attributes = {
            content_buildable_type: Project.name,
            content_buildable_id: params[:project_id],
            code: params[:code]
          }
          attributes[:enabled] = to_boolean(layout_params[:enabled]) if layout_params.key? :enabled
          if layout_params.key? :craftjs_jsonmultiloc
            attributes[:craftjs_jsonmultiloc] = clean(layout_params[:craftjs_jsonmultiloc])
          end
          attributes
        end

        def params_for_update
          layout_params = params_for_upsert
          attributes = {}
          attributes[:enabled] = to_boolean(layout_params[:enabled]) if layout_params.key? :enabled
          return attributes unless layout_params.key? :craftjs_jsonmultiloc

          attributes[:craftjs_jsonmultiloc] = (
            @layout.craftjs_jsonmultiloc || {}
          ).merge(
            clean(layout_params[:craftjs_jsonmultiloc])
          )
          attributes
        end

        def to_boolean(value)
          ActiveModel::Type::Boolean.new.cast(value)
        end

        def clean(craftjs_jsonmultiloc)
          allowed_locale_keys = CL2_SUPPORTED_LOCALES.map(&:to_s)
          craftjs_jsonmultiloc.to_hash.slice(*allowed_locale_keys)
        end
      end
    end
  end
end
