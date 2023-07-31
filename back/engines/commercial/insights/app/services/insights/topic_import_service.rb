# frozen_string_literal: true

module Insights
  class TopicImportService
    # Creates categories and assignments copying ideas_topics
    #
    # @param [Insights::View] view
    # @param [User] current_user
    # @return [Array<String>] The ids of the created assignments
    def copy_assignments(view, current_user)
      locale = current_user.locale
      topics(view).flat_map do |topic|
        category = Category.new(name: category_name(topic, locale), view: view)
        if category.save
          ideas = IdeasFinder.new(
            { project: view.scope, topics: [topic] },
            current_user: current_user
          ).find_records
          assignment_service.add_assignments_batch(ideas, [category])
        end
      end
    end

    private

    def assignment_service
      @assignment_service ||= Insights::CategoryAssignmentsService.new
    end

    def topics(view)
      Topic.includes(:projects_allowed_input_topics).where(projects_allowed_input_topics: { project_id: view.scope.id })
    end

    def category_name(topic, locale)
      topic.title_multiloc[locale] || topic.title_multiloc.first
    end
  end
end
