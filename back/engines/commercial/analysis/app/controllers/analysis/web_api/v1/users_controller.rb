# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class UsersController < ApplicationController
        before_action :set_analysis
        before_action :set_user

        def show
          render json: WebApi::V1::AnalysisUserSerializer.new(@user, params: { app_configuration: AppConfiguration.instance, **jsonapi_serializer_params }).serializable_hash
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
      end
    end
  end
end
