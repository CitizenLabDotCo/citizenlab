# frozen_string_literal: true

class ProjectsFilteringService
  include Filterer

  HOMEPAGE_FILTER_PARAMS = []

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

  HOMEPAGE_FILTER_PARAMS << :topics
  add_filter('by_topics') do |scope, options|
    topics = options[:topics]
    topics ? scope.with_some_topics(topics) : scope
  end

  HOMEPAGE_FILTER_PARAMS << :areas
  add_filter('by_areas') do |scope, options|
    areas = options[:areas]
    areas ? scope.with_some_areas(areas).or(scope.with_all_areas) : scope
  end

  add_filter('filter_ids') do |scope, options|
    keep_ids = options[:filter_ids]
    keep_ids ? scope.where(id: keep_ids) : scope
  end

  add_filter('can_moderate') do |scope, options|
    next scope unless ['true', true, '1'].include? options[:filter_can_moderate]

    current_user = options[:current_user] # nil means the user is not logged in
    if current_user
      ::UserRoleService.new.moderatable_projects current_user, scope
    else
      scope.none
    end
  end

  add_filter('is_moderator_of') do |scope, options|
    next scope unless (['true', true, '1'].include? options[:filter_is_moderator_of]) ||
                      options[:filter_user_is_moderator_of].present?

    user = if options[:filter_user_is_moderator_of].present?
      User.find_by(id: options[:filter_user_is_moderator_of])
    else
      options[:current_user]
    end

    next scope.none unless user

    moderated_project_ids = user.roles.select { |r| r['type'] == 'project_moderator' }.pluck('project_id')

    scope.where(id: moderated_project_ids)
  end
end
