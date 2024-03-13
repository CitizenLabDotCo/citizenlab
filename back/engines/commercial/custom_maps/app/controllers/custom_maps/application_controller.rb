# frozen_string_literal: true

module CustomMaps
  class ApplicationController < ::ApplicationController
    skip_before_action :authenticate_user, only: %i[show]

    private

    def set_project
      @project = Project.find(params[:project_id])
    end
  end
end
