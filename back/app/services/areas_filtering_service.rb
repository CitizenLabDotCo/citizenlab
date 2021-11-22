class AreasFilteringService
  include Filterer

  add_filter('for_homepage_filter') do |scope, options|
    params = options[:params]
    current_user = options[:current_user]

    next scope unless ['true', true, '1'].include? params[:for_homepage_filter]

    homepage_publications =
      AdminPublicationsService.new.for_homepage AdminPublicationPolicy::Scope.new(
        current_user,
        AdminPublication
      ).resolve

    projects_for_filter =
      Project.includes(:admin_publication)
             .where(id: homepage_publications.where(publication_type: 'Project').select(:publication_id))
             .or(Project.includes(:admin_publication).where(admin_publication: { parent_id: homepage_publications }))

    Area.where(id: AreasProject.where(project: projects_for_filter).select(:area_id))
  end
end
