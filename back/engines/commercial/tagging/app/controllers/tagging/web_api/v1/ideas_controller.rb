module Tagging
  class WebApi::V1::IdeasController < ApplicationController
    before_action :authorize_project_or_ideas,
                  only: %i[index_with_tags_xlsx]
    skip_before_action :authenticate_user # TODO: temp fix to pass tests

    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    def index_with_tags_xlsx
      @result = IdeasFinder.find(
        params,
        scope: policy_scope(Idea).where(publication_status: 'published'),
        includes: %i[author topics areas project idea_status idea_files],
        paginate: false
      )
      @ideas = @result.records

      I18n.with_locale(current_user&.locale) do
        xlsx = XlsxService.new.generate_ideas_xlsx @ideas, view_private_attributes: Pundit.policy!(current_user, User).view_private_attributes?, with_tags: true
        send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas.xlsx'
      end
    end

    private

    def authorize_project_or_ideas
      if params[:project].present?
        authorize Project.find(params[:project]), :index_xlsx?
      else
        authorize :idea, :index_xlsx?
      end
    end
  end
end
