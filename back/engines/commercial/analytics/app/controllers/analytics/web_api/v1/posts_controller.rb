# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class PostsController < ::ApplicationController

      skip_after_action :verify_policy_scoped, only: :index # The view is authorized instead.

      # GET /posts
      def index

        posts = Rails.configuration.database_configuration

        # TODO: Try and set the schema search path in db config as a better local dev option
        # Hasn't seemed to work
        # posts = ActiveRecord::Base.connection.current_database
        posts = FactPost.where(feedback_none: 0)
        render json: posts
      end

    end
  end
end
