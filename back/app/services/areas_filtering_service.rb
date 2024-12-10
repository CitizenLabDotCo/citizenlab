# frozen_string_literal: true

class AreasFilteringService
  include Filterer

  add_filter('for_homepage_filter') do |scope, options|
    params, current_user = options.fetch_values(:params, :current_user)
    next scope unless ['true', true, '1'].include? params[:for_homepage_filter]

    projects_for_filter = ProjectsFilteringService.for_homepage_filter(current_user)

    if projects_for_filter.any?(&:include_all_areas)
      Area.all
    else
      Area.where(id: AreasProject.where(project: projects_for_filter).select(:area_id))
    end
  end

  add_filter('for_onboarding') do |scope, options|
    params = options.fetch(:params)

    if params[:for_onboarding]
      include_in_onboarding = ActiveModel::Type::Boolean.new.cast(params[:for_onboarding])
      scope.where(include_in_onboarding: include_in_onboarding)
    else
      scope
    end
  end
end
