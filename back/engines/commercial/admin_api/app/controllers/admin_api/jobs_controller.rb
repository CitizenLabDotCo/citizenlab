# frozen_string_literal: true

module AdminApi
  class JobsController < AdminApiController
    def show
      job = QueJob.find(params[:id])
      render json: AdminApi::JobSerializer.new(job).to_json
    end
  end
end
