# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
  end

  post 'web_api/v1/ideas' do
    before do
      IdeaStatus.create_defaults
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      @project = create(:continuous_project)
    end

    with_options scope: :idea do
      parameter :project_id
      parameter :publication_status
      parameter :title_multiloc
      parameter :body_multiloc
      parameter :location_point_geojson
      parameter :location_description
    end

    let(:idea) { build(:idea) }
    let(:project_id) { @project.id }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { idea.title_multiloc }
    let(:body_multiloc) { idea.body_multiloc }
    let(:location_description) { 'Stanley Road 4' }

    example 'Toxicity detection job is enqueued when creating an idea', document: false do
      expect do
        do_request
      end.to have_enqueued_job(ToxicityDetectionJob)
    end
  end

  patch 'web_api/v1/ideas/:id' do
    before do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      @idea = create(:idea, author: @user)
    end

    with_options scope: :idea do
      parameter :title_multiloc
      parameter :body_multiloc
      parameter :location_description
      parameter :budget
    end

    let(:id) { @idea.id }

    describe do
      let(:title_multiloc) { { 'en' => 'Changed title' } }
      let(:location_description) { 'Watkins Road 8' }

      example 'Toxicity detection job is enqueued when updating an idea\'s title and location description', document: false do
        expect do
          do_request
        end.to have_enqueued_job(ToxicityDetectionJob).with(@idea, attributes: %i[title_multiloc location_description])
      end
    end

    describe 'when already flagged' do
      before do
        create(:inappropriate_content_flag, flaggable: @idea, toxicity_label: 'insult')
      end

      describe do
        let(:title_multiloc) { { 'en' => 'Changed title' } }

        example 'Toxicity detection job is enqueued when updating an idea\'s title and re-verifies all fields', document: false do
          expect do
            do_request
          end.to have_enqueued_job(ToxicityDetectionJob).with(@idea, attributes: %i[title_multiloc body_multiloc location_description])
        end
      end

      describe do
        let(:budget) { 17 }

        example 'No toxicity detection job is enqueued when updating an idea\'s budget', document: false do
          expect do
            do_request
          end.not_to have_enqueued_job(ToxicityDetectionJob)
        end
      end
    end

    describe do
      let(:budget) { 11 }

      example 'No toxicity detection job is enqueued when updating idea attributes without text', document: false do
        expect do
          do_request
        end.not_to have_enqueued_job(ToxicityDetectionJob)
      end
    end
  end
end
