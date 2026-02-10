# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class ContentBuilderLayoutsController < ApplicationController
        skip_before_action :authenticate_user, only: %i[show]

        def show
          render json: WebApi::V1::LayoutSerializer.new(layout, params: jsonapi_serializer_params).serializable_hash
        end

        def upsert
          @layout = Layout.find_by(content_buildable: content_buildable, code: params[:code]).tap do |layout|
            authorize layout if layout
          end
          @layout ? update : create
        end

        def destroy
          side_fx_service.before_destroy(layout, current_user)
          layout.destroy
          if layout.destroyed?
            side_fx_service.after_destroy(layout, current_user)
            head :ok
          else
            head :internal_server_error
          end
        end

        private

        def content_buildable
          @content_buildable ||= case params[:content_buildable]
          when 'Project'
            Project.find params[:project_id]
          when 'ProjectFolder'
            ProjectFolders::Folder.find params[:project_folder_id]
          when 'HomePage'
            nil
          end
        end

        def layout
          @layout ||= Layout.find_by!(content_buildable: content_buildable, code: params[:code]).tap do |layout|
            authorize layout
          end
        end

        def side_fx_service
          @side_fx_service ||= ::ContentBuilder::SideFxLayoutService.new
        end

        def update
          layout.assign_attributes params_for_update
          side_fx_service.before_update layout, current_user
          if layout.save
            side_fx_service.after_update layout, current_user
            render json: WebApi::V1::LayoutSerializer.new(
              layout,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :ok
          else
            render json: { errors: @layout.errors.details }, status: :unprocessable_entity
          end
        end

        def create
          @layout = Layout.new params_for_create

          if @layout.craftjs_json == {}
            @layout.craftjs_json = ContentBuilder::Craftjs::DefaultLayoutService.new.default_layout(content_buildable)
          end

          layout.content_buildable = content_buildable
          authorize layout
          side_fx_service.before_create layout, current_user
          if layout.save
            side_fx_service.after_create layout, current_user
            render json: WebApi::V1::LayoutSerializer.new(
              layout,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :created
          else
            render json: { errors: layout.errors.details }, status: :unprocessable_entity
          end
        end

        def params_for_upsert
          params
            .require(:content_builder_layout)
            .permit(:enabled, { craftjs_json: {} })
            .to_h
        end

        def params_for_create
          layout_params = params_for_upsert
          { code: params[:code] }.tap do |attributes|
            attributes[:enabled] = to_boolean(layout_params[:enabled]) if layout_params.key? :enabled
            attributes[:craftjs_json] = layout_params[:craftjs_json] if layout_params.key? :craftjs_json
          end
        end

        def params_for_update
          layout_params = params_for_upsert
          {}.tap do |attributes|
            attributes[:enabled] = to_boolean(layout_params[:enabled]) if layout_params.key? :enabled
            attributes[:craftjs_json] = layout_params[:craftjs_json] if layout_params.key? :craftjs_json
          end
        end

        def to_boolean(value)
          ActiveModel::Type::Boolean.new.cast(value)
        end
      end
    end
  end
end

ContentBuilder::WebApi::V1::ContentBuilderLayoutsController.include(AggressiveCaching::Patches::WebApi::V1::ContentBuilderLayoutsController)
