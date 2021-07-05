# frozen_string_literal: true

require 'rails_helper'

describe Insights::TopicCategoryService do
  let(:topic1) { create(:topic) }
  let(:topic2) { create(:topic, title_multiloc: { 'en': "Nature"}) }
  let(:topic3) { create(:topic, title_multiloc: { 'en': "Other"}) }
  let(:ideas) { create_list(:idea, 3, topics: [topic1, topic2]) }
  let(:project) { create(:project, topics: [topic1, topic2, topic3], ideas: ideas) }
  subject(:service) { described_class.new }
  let(:view) { create(:view, scope: project) }
  let(:user) {create(:user)}
  let(:assignment_service) { Insights::CategoryAssignmentsService.new }

  describe 'copy_assignments' do
    it 'assigns categories corresponding to topics' do
      assignment_ids = service.copy_assignments(view, user)
      assignments = Insights::CategoryAssignment.find(assignment_ids)


      aggregate_failures 'check assignments' do
        expect(assignments.count).to eq(6)
        expect(assignment_service.approved_assignments(ideas[1], view).pluck(:category_id).length).to eq(2)
        expect(assignments.pluck(:category_id).uniq.length).to eq(2)
        expect(view.categories.length).to eq(3)
      end
    end
  end
end
