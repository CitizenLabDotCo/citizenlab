# frozen_string_literal: true

module CustomMaps
  class ApplicationController < ::ApplicationController
    skip_before_action :authenticate_user, only: %i[show]

    private

    def set_project
      @project = Project.find(params[:project_id])
    end

    def set_custom_field
      @custom_field = CustomField.find(params[:custom_field_id])
      authorize @custom_field, policy_class: MapConfigCustomFieldPolicy
    end
  end
end
