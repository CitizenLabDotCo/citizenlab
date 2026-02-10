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

    describe 'remove_flag_if_approved' do
      let!(:prescreening_status) { create(:idea_status_prescreening) }
      let!(:proposed_status) { create(:idea_status_proposed) }

      it 'removes flag when idea transitions from prescreening to proposed status' do
        idea = create(:idea, idea_status: prescreening_status, publication_status: 'submitted')
        flag = create(:inappropriate_content_flag, flaggable: idea)
        idea.update!(idea_status: proposed_status, publication_status: 'published')

        expect { service.after_update(idea, user) }
          .to have_enqueued_job(LogActivityJob)
          .with(flag, 'deleted', nil, anything, anything)

        expect(flag.reload).to be_deleted
      end

      it 'does not remove flag when idea remains in prescreening status' do
        idea = create(:idea, idea_status: prescreening_status, publication_status: 'submitted')
        flag = create(:inappropriate_content_flag, flaggable: idea)

        idea.update!(title_multiloc: { 'en' => 'Updated title' })
        service.after_update(idea, user)

        expect(flag.reload).not_to be_deleted
      end

      it 'does not remove flag when idea transitions between two public statuses' do
        idea = create(:idea, idea_status: proposed_status)
        flag = create(:inappropriate_content_flag, flaggable: idea)
        other_public_status = create(:idea_status)

        idea.update!(idea_status: other_public_status)
        service.after_update(idea, user)

        expect(flag.reload).not_to be_deleted
      end
    end
  end
end
