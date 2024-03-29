# frozen_string_literal: true

module AdminApi
  class JobsController < AdminApiController
    def show
      job = QueJob.find(params[:id])
      if show_authorized?(job)
        render json: AdminApi::JobSerializer.new(job).to_json
      else
        head :forbidden
      end
    end

    private

    def show_authorized?(job)
      job.args['job_class'] == AdminApi::CopyProjectJob.name
    end
  end
end
