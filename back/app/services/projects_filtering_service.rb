class ProjectsFilteringService
  include Filterer

  add_filter("by_topics") do |scope, options|
    topics = options[:topics]
    topics ? scope.with_all_topics(topics) : scope
  end

  add_filter("by_areas") do |scope, options|
    if (areas = options[:areas])
      scope.with_some_areas(areas)
    else
      scope
    end
  end

  add_filter("filter_ids") do |scope, options|
    keep_ids = options[:filter_ids]
    keep_ids ? scope.where(id: keep_ids) : scope
  end
end

ProjectsFilteringService.include_if_ee('ProjectManagement::Patches::ProjectsFilteringService')
