# frozen_string_literal: true

class AreasFilteringService
  include Filterer

  add_filter('for_homepage_filter') do |scope, params:, current_user:, **_options|
    next scope unless ['true', true, '1'].include? params[:for_homepage_filter]

    projects_for_filter = ProjectsFilteringService.for_homepage_filter(current_user)
    Area.where(id: AreasProject.where(project: projects_for_filter).select(:area_id))
  end

  add_filter('for_onboarding') do |scope, params:, **_options|
    if params[:for_onboarding]
      include_in_onboarding = ActiveModel::Type::Boolean.new.cast(params[:for_onboarding])
      scope.where(include_in_onboarding: include_in_onboarding)
    else
      scope
    end
  end
end
