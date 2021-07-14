module CustomMaps
  class ApplicationController < ::ApplicationController
    before_action :set_project
    skip_before_action :authenticate_user, only: %i[show]

    private

    def set_project
      @project = Project.find(params[:project_id])
    end
  end
end
