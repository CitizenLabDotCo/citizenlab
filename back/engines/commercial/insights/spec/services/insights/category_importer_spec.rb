# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::CategoryImporter do

  before_all do
    projects = create_list(:project_with_allowed_input_topics, 3, allowed_input_topics_count: 2)

    # Create the test view
    p1, p2 = @origins = projects.take(2)
    @view = create(:view, data_sources: @origins.map { |p| create(:data_source, origin: p) })

    # Both origins share one topic
    p1.projects_allowed_input_topics << p2.projects_allowed_input_topics.first

    # Add some ideas to the projects
    p1_topics = p1.projects_allowed_input_topics.map(&:topic)
    create_list(:idea, 2, project: p1, topics: p1_topics)

    p2_topics = p2.projects_allowed_input_topics.map(&:topic)
    p2_ideas = create_list(:idea, 2, project: p2)
    p2_ideas.first.topics = p2_topics.take(1)
  end

  let_it_be(:view) { @view }
  let_it_be(:origins) { @origins }

  describe '#import' do
    before_all { described_class.new.import(view) }

    it 'imports project topics as categories (without duplicates)' do
      expected_source_topics = origins.flat_map { |p| p.projects_allowed_input_topics.map(&:topic) }.uniq
      expect(view.categories.count).to eq(4)
      expect(view.categories.map(&:source)).to match_array(expected_source_topics)
    end

    it 'import topic assignments (project) as category assignments (view)' do
      assignments = Insights::CategoryAssignment.where(category: view.categories)
      nb_topic_assignments = IdeasTopic.joins(:idea).where(ideas: { project: origins }).count
      expect(assignments.count).to eq(nb_topic_assignments)

      assignments.each do |assignment|
        expect(assignment.input.topic_ids).to include(assignment.category.source_id)
      end
    end
  end
end

