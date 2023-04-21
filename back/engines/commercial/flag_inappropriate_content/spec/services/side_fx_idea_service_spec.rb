# frozen_string_literal: true

require 'rails_helper'

describe SideFxIdeaService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_create' do
    it 'triggers toxicity detection for an idea' do
      idea = create(:idea)
      expect { service.after_create(idea, user) }.to have_enqueued_job(ToxicityDetectionJob).exactly(1).times
    end

    it "doesn't trigger toxicity detection for a native survey response" do
      IdeaStatus.create_defaults
      response = create(:idea, project: create(:continuous_native_survey_project))
      expect { service.after_create(response, user) }.not_to have_enqueued_job(ToxicityDetectionJob)
    end
  end

  describe 'after_update' do
    it 'triggers toxicity detection for an idea' do
      idea = create(:idea)
      idea.update!(title_multiloc: { 'en' => 'Updated title' })
      expect { service.after_update(idea, user) }.to have_enqueued_job(ToxicityDetectionJob).exactly(1).times
    end

    it "doesn't trigger toxicity detection for a native survey response" do
      IdeaStatus.create_defaults
      response = create(:idea, project: create(:continuous_native_survey_project))
      response.update!(title_multiloc: { 'en' => 'Updated title' })
      expect { service.after_update(response, user) }.not_to have_enqueued_job(ToxicityDetectionJob)
    end
  end
end
