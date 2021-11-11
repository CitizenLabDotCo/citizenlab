class AreasFilteringService
  include Filterer

  add_filter('only_selected') do |scope, options|
    params = options[:params]
    current_user = options[:current_user]

    next scope unless ['true', true, '1'].include? params[:only_selected]

    publications = AdminPublicationPolicy::Scope.new(current_user, AdminPublication).resolve.includes(:parent)
    project_publications = publications.where(publication_type: Project.name).where.not(publication_status: :draft)

    children_of_non_draft_parents = project_publications.where.not(parent: { publication_status: :draft })
    projects_without_parents      = project_publications.where(parent_id: nil)

    visible_project_publications = children_of_non_draft_parents.or(projects_without_parents)

    areas_ids = AreasProject.where(project_id: visible_project_publications.select(:publication_id)).select(:area_id)
    scope.where(id: areas_ids)
  end
end
