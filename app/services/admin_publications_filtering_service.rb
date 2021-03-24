class AdminPublicationsFilteringService
  include Filterer

  attr_reader :children_counts

  # NOTE: This service is very fragile and the order of filters matters for the Front-End.

  # The base scope:
  #     In controllers, the only filtering perfomed before was AdminPublicationPolicy::Scope,
  #     so the base scope is the result of permission filters.

  # #filter_childless_parents
  #   This filter makes sure that:
  #     1. We show parent publications that have children the current_user can see.
  #     2. We show parent publications that have no children.
  #     3. We show parent publications with children that haven't been published yet but the user can see.
  add_filter('filter_childless_parents') do |scope, options|
    next scope unless options[:filter_childless_parents] == 'true'

    parents_without_visible_children = scope.where(id: scope.pluck(:parent_id).compact.uniq)
    parents_without_any_children     = scope.where(children_allowed: true, children_count: 0)
    non_parents                      = scope.where(children_allowed: false)

    parents_without_visible_children.or(parents_without_any_children).or(non_parents)
  end

  add_filter('by_publication_status') do |scope, options|
    publication_status = options[:publication_statuses]
    publication_status ? scope.where(publication_status: publication_status) : scope
  end

  add_filter('filter_projects') do |scope, options|
    projects = Project.where(id: scope.where(publication_type: Project.name).select(:publication_id))
    filtered_projects = ProjectsFilteringService.new.filter(projects, options)

    project_publications = scope.where(publication: filtered_projects)
    other_publications = scope.where.not(publication_type: Project.name)
    project_publications.or(other_publications)
  end

  add_filter('compute_visible_children_counts') do |scope, _|
    # TODO: this is a workaround (not a filter) to compute @children_counts before the 'top_level_only' and 'folder' filter.
    # It must be done before bc when keeping only top-level publications (by_folder with folder == ""), the
    # children counts cannot be longer properly computed ex post.
    @children_counts = Hash.new(0).tap do |counts|
      parent_ids = scope.pluck(:parent_id).compact
      parent_ids.each { |id| counts[id] += 1 }
    end
    scope
  end

  add_filter('top_level_only') do |scope, options|
    options[:depth] == '0' ? scope.where(depth: 0) : scope
  end
end
