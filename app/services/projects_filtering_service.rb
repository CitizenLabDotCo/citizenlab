
#noinspection RubyJumpError
class ProjectsFilteringService
  include Filterer

  add_filter("by_topics") do |scope, options|
    return scope unless (topics = options[:topics])
    scope.with_all_topics(topics)
  end

  add_filter("by_areas") do |scope, options|
    return scope unless (areas = options[:areas])
    scope.with_some_areas(areas).or(scope.without_areas)
  end

  add_filter("filter_ids") do |scope, options|
    return scope unless (keep_ids = options[:filter_ids])
    scope.where(id: keep_ids)
  end

end
