# frozen_string_literal: true

class AdminPublicationsFilteringService
  include Filterer

  attr_reader :visible_children_counts_by_parent_id

  class << self
    def for_homepage_filter(scope)
      scope ||= AdminPublication.all
      scope.where.not(publication_status: :draft).where(depth: 0)
    end
  end

  # NOTE: This service is very fragile and the ORDER of filters matters for the Front-End, do not change it.

  add_filter('only_projects') do |scope, options|
    next scope unless ['true', true, '1'].include? options[:only_projects]

    scope.where(publication_type: Project.name)
  end

  # This filter removes AdminPublications that represent folders,
  # which contain *only* projects which should not be visible to the current user.
  add_filter('remove_not_allowed_parents') do |scope, options|
    next scope unless ['true', true, '1'].include? options[:remove_not_allowed_parents]

    # Remove folders (parents) that contain only draft children (projects) &/or children (projects) the user cannot see
    parents_with_visible_children = scope.where(id: scope.not_draft.filter_map(&:parent_id).uniq)
    parents_without_any_children  = scope.where(children_allowed: true, children_count: 0)
    non_parents                   = scope.where(children_allowed: false)

    parents_with_visible_children
      .or(parents_without_any_children)
      .or(non_parents)
  end

  add_filter('by_publication_status') do |scope, options|
    publication_status = options[:publication_statuses]

    publication_status ? scope.where(publication_status: publication_status) : scope
  end

  add_filter('filter_projects') do |scope, options|
    projects = Project.where(id: scope.where(publication_type: Project.name).select(:publication_id))
    filtered_projects = ProjectsFilteringService.new.filter(projects, options)

    if options[:search].present?
      project_ids = filtered_projects.search_ids_by_all_including_patches(options[:search])
    end

    project_publications = scope.where(publication: project_ids || filtered_projects)
    other_publications = scope.where.not(publication_type: Project.name)
    project_publications.or(other_publications)
  end

  add_filter('filter_folders') do |scope, options|
    next scope if options[:search].blank?

    matching_folders = ProjectFolders::Folder.search_by_all(options[:search])
    folder_publications_in_scope = scope.where(publication: matching_folders)
    projects_still_in_scope = scope.where.not(publication_type: ProjectFolders::Folder.name)

    folder_publications_in_scope.or(projects_still_in_scope)
  end

  add_filter('compute_visible_children_counts') do |scope, _|
    # TODO: this is a workaround (not a filter) to compute @children_counts before the 'top_level_only' and 'folder' filter.
    # It must be done before bc when keeping only top-level publications (by_folder with folder == ""), the
    # children counts cannot be longer properly computed ex post.
    @visible_children_counts_by_parent_id = Hash.new(0).tap do |counts|
      parent_ids = scope.pluck(:parent_id).compact
      parent_ids.each { |id| counts[id] += 1 }
    end
    scope
  end

  # We remove childless parents if any filter is applied
  add_filter('remove_childless_parents') do |scope, options|
    filter_params = ProjectsFilteringService::HOMEPAGE_FILTER_PARAMS
    next scope unless filter_params.any? { |param| options[param].present? }

    parents_with_children = scope.where(id: scope.select(:parent_id).where.not(parent_id: nil).distinct)
    non_parents           = scope.where(children_allowed: false)

    parents_with_children.or(non_parents)
  end

  add_filter('remove_unmoderated_folders') do |scope, options|
    next scope unless (['true', true, '1'].include? options[:filter_is_moderator_of]) ||
                      options[:filter_user_is_moderator_of].present?

    moderator = User.find_by(id: options[:filter_user_is_moderator_of])
    user = moderator.presence || options[:current_user]

    next scope.where(children_allowed: false) unless user

    moderated_folder_ids = user.roles.select { |r| r['type'] == 'project_folder_moderator' }.pluck('project_folder_id')
    unmoderated_parents = scope.where(children_allowed: true).where.not(publication_id: moderated_folder_ids)

    scope.where.not(id: unmoderated_parents)
  end

  add_filter('top_level_only') do |scope, options|
    [0, '0'].include?(options[:depth]) ? scope.where(depth: 0) : scope
  end

  # Keep that as the last filter, this acts as a failsafe.
  # If any of the filters before return duplicate admin publications, we remove them at the last step
  add_filter('distinct') do |scope, _options|
    scope.distinct
  end

  add_filter('by_folder') do |scope, options|
    next scope unless options.key? :folder

    folder_id = options[:folder]
    if folder_id.blank?
      scope.where(parent_id: nil) # keeps on top-level publications
    else
      folder = AdminPublication.where(publication_id: folder_id, publication_type: ProjectFolders::Folder.name)
      scope.where(parent_id: folder) # .or(folder) Maybe we should add the folder itself
    end
  end
end
