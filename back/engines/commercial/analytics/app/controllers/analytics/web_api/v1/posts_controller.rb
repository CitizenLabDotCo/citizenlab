# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class PostsController < ::ApplicationController

      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      # GET /posts
      def index
        posts = FactPost.includes(:type, :project, :created_date)
        posts = posts.where(:type => {name: params[:type]}) if params[:type].present?
        posts = posts.where(:project => {id: params[:project]}) if params[:project].present?
        if params[:date].present?
          dates = params[:date].split(':')
          from = Date.parse(dates[0])
          to = Date.parse(dates[1])
          posts = posts.where(:created_date => {date: from..to})
        end
        
        render json: posts, include: [:type, :project, :created_date]
      end

    end
  end
end
