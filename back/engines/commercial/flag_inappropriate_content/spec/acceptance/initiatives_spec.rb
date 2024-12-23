# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# TODO: cleanup-after-proposals-migration
resource 'Initiatives' do
  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user

    create(:initiative_status, code: 'proposed')
  end

  post 'web_api/v1/initiatives' do
    with_options scope: :initiative do
      parameter :publication_status
      parameter :title_multiloc
      parameter :body_multiloc
      parameter :location_description
    end

    let(:initiative) { build(:initiative) }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { initiative.title_multiloc }
    let(:body_multiloc) { initiative.body_multiloc }

    example 'Toxicity detection job is enqueued when creating an initiative', document: false do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      expect do
        do_request
      end.to have_enqueued_job(ToxicityDetectionJob)
    end
  end

  patch 'web_api/v1/initiatives/:id' do
    before do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      @initiative = create(:initiative, author: @user)
    end

    with_options scope: :initiative do
      parameter :title_multiloc
      parameter :body_multiloc
      parameter :location_description
      parameter :topic_ids
    end

    let(:id) { @initiative.id }

    describe do
      let(:location_description) { 'Watkins Road 8' }

      example 'Toxicity detection job is enqueued when updating an initiative\'s title', document: false do
        expect do
          do_request
        end.to have_enqueued_job(ToxicityDetectionJob).with(@initiative, attributes: [:location_description])
      end
    end

    describe do
      let(:topic_ids) { [create(:topic).id] }

      example 'No toxicity detection job is enqueued when updating initiative attributes without text', document: false do
        expect do
          do_request
        end.not_to have_enqueued_job(ToxicityDetectionJob)
      end
    end
  end
end
