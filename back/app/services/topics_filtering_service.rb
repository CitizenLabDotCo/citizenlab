# frozen_string_literal: true

# copied from AreasFilteringService in back/app/services/areas_filtering_service.rb
class TopicsFilteringService
  include Filterer

  add_filter('for_homepage_filter') do |scope, options|
    params, current_user = options.fetch_values(:params, :current_user)
    next scope unless ['true', true, '1'].include? params[:for_homepage_filter]

    projects_for_filter = ProjectsFilteringService.for_homepage_filter(current_user)
    Topic.where(id: ProjectsTopic.where(project: projects_for_filter).select(:topic_id))
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

  add_filter('by_codes') do |scope, options|
    params = options.fetch(:params)

    result = scope
    result = result.where(code: params[:code]) if params[:code].present?
    result = result.where.not(code: params[:exclude_code]) if params[:exclude_code].present?
    result
  end
end
