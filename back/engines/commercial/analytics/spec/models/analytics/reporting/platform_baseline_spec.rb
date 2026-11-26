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

    it 'leaves out hidden projects, such as the community monitor' do
      add_participants(create(:project_with_active_ideation_phase, hidden: true), 50)

      expect(baseline('participants_per_project').projects_counted).to eq 5
      expect(baseline('participants_per_project').mean).to eq 1.0
    end

    it 'counts resident visitors only, once per project' do
      project = projects.first
      create(:session, :with_pageview, project: project, monthly_user_hash: 'resident-a')
      create(:session, :with_pageview, project: project, monthly_user_hash: 'resident-a')
      create(:session, :with_pageview, project: project, monthly_user_hash: 'resident-b')
      create(:session, :with_pageview, project: project, monthly_user_hash: 'staff', highest_role: 'admin')

      expect(baseline('visitors_per_project').p75).to eq 0
      expect(baseline('visitors_per_project').mean).to eq 0.4
    end
  end

  context 'with per-phase metrics' do
    let!(:projects) { create_list(:project_with_active_ideation_phase, 4) }

    def survey_project
      project = create(:project)
      phase = create(:native_survey_phase, project: project, start_at: 10.days.ago, end_at: nil)
      create(:custom_field_linear_scale, resource: create(:custom_form, participation_context: phase))
      project
    end

    def answer_survey(project, count)
      IdeaStatus.find_by(code: 'proposed', participation_method: 'ideation') || create(:idea_status_proposed)
      phase = project.phases.first
      question = phase.custom_form.custom_fields.first
      count.times do
        response = create(:native_survey_response, project: project, creation_phase: phase)
        create(:custom_field_answer, answerable: response, custom_field: question, value: 3)
      end
    end

    it 'counts the projects behind the phases for the floor, not the phases' do
      project = create(:project)
      5.times do |i|
        create(:single_voting_phase, project: project, start_at: (30 - (i * 5)).days.ago, end_at: (28 - (i * 5)).days.ago)
      end

      expect(baseline('online_voters_per_voting_phase')).to be_nil
      expect(baseline('phases_per_project').projects_counted).to eq 5
    end

    it 'takes the online voters of each voting phase that has started' do
      voting = [6, 2, 0, 0, 0].map do |voters|
        create(:single_voting_phase, project: create(:project), start_at: 10.days.ago, end_at: 2.days.from_now, baskets_count: voters)
      end
      create(:single_voting_phase, project: voting.first.project, start_at: 5.days.from_now, baskets_count: 50)

      voters = baseline('online_voters_per_voting_phase')
      expect(voters.projects_counted).to eq 5
      expect(voters.median).to eq 0
      expect(voters.mean).to eq 1.6
    end

    it 'counts survey responses, not the comments and reactions made while a survey runs' do
      surveys = Array.new(4) { survey_project }
      answer_survey(surveys.first, 2)

      mixed = create(:project_with_past_ideation_and_current_native_survey_phase)
      idea = create(:idea, project: mixed, phases: [mixed.phases.order(:start_at).first], submitted_at: 20.days.ago, published_at: 20.days.ago)
      create_list(:comment, 3, idea: idea)
      create(:reaction, reactable: idea)

      responses = baseline('survey_responses_per_survey_phase')
      expect(responses.projects_counted).to eq 5
      expect(responses.mean).to eq 0.4
    end
  end
end
