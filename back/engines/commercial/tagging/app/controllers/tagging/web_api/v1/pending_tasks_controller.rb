module Tagging
  module WebApi
    module V1
      class PendingTasksController < ApplicationController
        def index
          @tasks = policy_scope(PendingTask)

          render json: WebApi::V1::PendingTaskSerializer.new(@tasks, params: fastjson_params).serialized_json
        end
      end
    end
  end
end
