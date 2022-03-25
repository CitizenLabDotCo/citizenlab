class AreasFilteringService
  include Filterer

  add_filter('for_homepage_filter') do |scope, params:, current_user:, **_options|
    next scope unless ['true', true, '1'].include? params[:for_homepage_filter]

    projects_for_filter = ProjectsFilteringService.for_homepage_filter(current_user)
    Area.where(id: AreasProject.where(project: projects_for_filter).select(:area_id))
  end
end
