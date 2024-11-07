# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class UsersController < ApplicationController
        before_action :set_analysis
        before_action :set_user

        def show
          render json: WebApi::V1::AnalysisUserSerializer.new(
            @user,
            params: {
              app_configuration: AppConfiguration.instance,
              view_private_attributes: view_private_attributes?,
              **jsonapi_serializer_params
            }
          ).serializable_hash
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def set_user
          @user = User.find params[:id]
          authorize @user
        end

        def view_private_attributes?
          return true unless @analysis.phase_id

          @analysis.phase.pmethod.supports_private_attributes_in_export?
        end
      end
    end
  end
end
