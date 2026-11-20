# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::PlatformBaseline do
  def baseline(metric) = described_class.find_by(metric: metric)

  def add_participants(project, count)
    phase = project.phases.first
    create_list(:idea, count, project: project, phases: [phase], submitted_at: Time.zone.now)
  end

  context 'with fewer than 5 projects behind a metric' do
    before { create_list(:project_with_active_ideation_phase, 4) }

    it 'leaves the metric out, so a small platform shows no other project\'s figure' do
      expect(described_class.count).to eq 0
    end
  end

  context 'with 5 started projects' do
    let!(:projects) { create_list(:project_with_active_ideation_phase, 5) }

    before do
      add_participants(projects.first, 3)
      add_participants(projects.second, 2)
    end

    it 'counts the projects with no participation as 0' do
      participants = baseline('participants_per_project')

      expect(participants.projects_counted).to eq 5
      expect(participants.median).to eq 0
      expect(participants.mean).to eq 1.0
      expect(participants.p75).to eq 2
    end

    it 'leaves out drafts and projects whose first phase has not started' do
      add_participants(create(:project_with_active_ideation_phase, :draft), 50)
      create(:project_with_future_native_survey_phase)

      expect(baseline('participants_per_project').projects_counted).to eq 5
      expect(baseline('participants_per_project').mean).to eq 1.0
    end

    it 'holds no row per project' do
      expect(described_class.pluck(:metric)).to all(end_with('_per_project').or(match(/_per_.*_phase\z/)))
      expect(described_class.column_names).not_to include('project_id')
    end
  end
end
