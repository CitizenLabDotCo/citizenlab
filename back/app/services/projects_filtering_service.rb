class ProjectsFilteringService
  include Filterer

  class << self
    def for_homepage_filter(current_user)
      homepage_publications =
        AdminPublicationsFilteringService.for_homepage_filter AdminPublicationPolicy::Scope.new(
          current_user,
          AdminPublication
        ).resolve

      Project.includes(:admin_publication)
             .where(id: homepage_publications.where(publication_type: 'Project').select(:publication_id))
             .or(Project.includes(:admin_publication).where(admin_publication: { parent_id: homepage_publications }))
    end
  end

  add_filter('by_topics') do |scope, options|
    topics = options[:topics]
    topics ? scope.with_some_topics(topics) : scope
  end

  add_filter('by_areas') do |scope, options|
    options[:areas] ? scope.with_some_areas(options[:areas]) : scope
  end

  add_filter('filter_ids') do |scope, options|
    keep_ids = options[:filter_ids]
    keep_ids ? scope.where(id: keep_ids) : scope
  end
end

ProjectsFilteringService.include_if_ee('ProjectManagement::Patches::ProjectsFilteringService')
