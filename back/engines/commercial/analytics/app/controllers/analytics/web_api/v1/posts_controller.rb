# frozen_string_literal: true

module Analytics
  module WebApi::V1
    class PostsController < ::ApplicationController
      skip_after_action :verify_policy_scoped, only: [:created]
      after_action :verify_authorized, only: [:created]

      def create
        query = QueryBuilderService.new(FactPost, params[:query])
        validation = query.validate
        
        if validation["messages"].length > 0
          render json: {"messages" => validation["messages"]}, status: 400
        else
          results = query.run
          render json: results
        end
      end
    end
  end
end
