# frozen_string_literal: true

module Insights
  class TopicCategoryService
    # Creates categories and assignments copying ideas_topics
    #
    # @param <View> view
    # @param <User> user
    # @return [strign] The ids of the created assignments
    def copy_assignments(view, current_user)
      locale = current_user.locale
      assignments = []
      topics(view).each { |topic|
        category = Category.new(name: title_to_name(topic, locale), view: view)
        if category.save
          ideas = IdeasFinder.find(
            {project: view.scope, topics: [topic]},
            current_user: current_user,
            paginate: false
          ).records
          assignments.concat(assignment_service.add_assignments_batch(ideas, [category]))
        end
      }
      assignments
    end

    private
    def assignment_service
      @assignment_service ||= Insights::CategoryAssignmentsService.new
    end

    def topics(view)
      Topic.includes(:projects_topics).where(projects_topics: {project_id: view.scope.id})
    end

    def title_to_name topic, locale
      topic.title_multiloc[locale] || topic.title_multiloc.first
    end
  end
end
