# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class ParticipationsController < ::ApplicationController

      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      # GET /participations
      def index
        activities = FactParticipation.includes(:type, :project, :created_date)
        activities = activities.where(:type => {name: params[:type]}) if params[:type].present?
        activities = activities.where(:project => {id: params[:project]}) if params[:project].present?
        if params[:date].present?
          dates = params[:date].split(':')
          from = Date.parse(dates[0])
          to = Date.parse(dates[1])
          activities = activities.where(:created_date => {date: from..to})
        end
        
        render json: activities, include: [:type, :project, :created_date]
      end

    end
  end
end
