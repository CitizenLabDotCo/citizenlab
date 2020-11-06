class AdminPublicationsFilteringService
  include Filterer

  attr_reader :children_counts

  add_filter("by_publication_status") do |scope, options|
    publication_status = options[:publication_statuses]
    publication_status ? scope.where(publication_status: publication_status) : scope
  end

  add_filter("filter_projects") do |scope, options|
    projects = Project.where(id: scope.where(publication_type: Project.name).select(:publication_id))
    filtered_projects = ProjectsFilteringService.new.filter(projects, options)

    project_publications = scope.where(publication: filtered_projects)
    other_publications = scope.where.not(publication_type: Project.name)
    project_publications.or(other_publications)
  end

end
