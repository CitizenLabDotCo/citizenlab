class AreasFilteringService
  include Filterer

  def initialize(current_user)
    @current_user = current_user
  end

  add_filter('only_selected') do |scope, options|
    next scope unless ['true', true, '1'].include? options[:only_selected]
    #byebug
    #publications = policy_scope(AdminPublication).includes(:parent)

    publications = AdminPublicationPolicy::Scope.new(@current_user, AdminPublication).resolve

    #publications = AdminPublication.includes(:parent)

    project_publications = publications.where(publication_type: Project.name).where.not(publication_status: :draft)

    children_of_non_draft_parents = project_publications.where.not(parent: { publication_status: :draft })
    projects_without_parents      = project_publications.where(parent_id: nil)

    visible_project_publications = children_of_non_draft_parents.or(projects_without_parents)

    areas_ids = AreasProject.where(project_id: visible_project_publications.select(:publication_id)).select(:area_id)
    scope.where(id: areas_ids)
  end
end