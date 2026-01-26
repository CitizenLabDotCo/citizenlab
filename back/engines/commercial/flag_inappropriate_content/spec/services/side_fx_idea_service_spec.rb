# frozen_string_literal: true

require 'rails_helper'

describe SideFxIdeaService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:phase) { create(:phase) }

  describe 'after_create' do
    it 'triggers toxicity detection for an idea' do
      idea = create(:idea)
      expect { service.after_create(idea, user, phase) }.to have_enqueued_job(ToxicityDetectionJob).exactly(1).times
    end

    it "doesn't trigger toxicity detection for a native survey response" do
      create(:idea_status_proposed)
      project = create(:single_phase_native_survey_project)
      response = create(:idea, project: project, creation_phase: project.phases.first)
      expect { service.after_create(response, user, phase) }.not_to have_enqueued_job(ToxicityDetectionJob)
    end
  end

  describe 'after_update' do
    it 'triggers toxicity detection for an idea' do
      idea = create(:idea)
      idea.update!(title_multiloc: { 'en' => 'Updated title' })
      expect { service.after_update(idea, user) }.to have_enqueued_job(ToxicityDetectionJob).exactly(1).times
    end

    it "doesn't trigger toxicity detection for a native survey response" do
      create(:idea_status_proposed)
      project = create(:single_phase_native_survey_project)
      response = create(:idea, project: project, creation_phase: project.phases.first)
      response.update!(title_multiloc: { 'en' => 'Updated title' })
      expect { service.after_update(response, user) }.not_to have_enqueued_job(ToxicityDetectionJob)
    end
  end
end
