# frozen_string_literal: true

require 'rails_helper'

describe 'rake fix_existing_tenants' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task[task_name] }

  describe ':remove_assignees_from_survey_responses' do
    before { create(:idea_status_proposed) }

    let(:task_name) { 'fix_existing_tenants:remove_assignees_from_survey_responses' }

    let_it_be(:assignee, reload: true) { create(:admin) }
    let_it_be(:idea1, reload: true) { create(:native_survey_response, assignee_id: assignee.id, assigned_at: Time.zone.now) }
    let_it_be(:idea2, reload: true) { create(:idea, assignee_id: assignee.id, assigned_at: Time.zone.now) }

    it 'only updates ideas that are native survey responses' do
      task.execute

      expect(idea1.reload.assignee_id).to be_nil
      expect(idea1.reload.assigned_at).to be_nil
      expect(idea2.reload.assignee_id).to eq(assignee.id)
      expect(idea2.reload.assigned_at).to be_an_instance_of(ActiveSupport::TimeWithZone)
    end
  end
end
