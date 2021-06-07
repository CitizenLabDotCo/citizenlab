require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource 'Initiatives' do
  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"

    create(:initiative_status, code: 'proposed')
  end

  post 'web_api/v1/initiatives' do
    with_options scope: :initiative do
      parameter :publication_status, 'Publication status', required: true, extra: "One of #{Post::PUBLICATION_STATUSES.join(',')}"
      parameter :title_multiloc, 'Multi-locale field with the initiative title', required: true, extra: 'Maximum 100 characters'
      parameter :body_multiloc, 'Multi-locale field with the initiative body', extra: 'Required if not draft'
      parameter :location_description, 'A human readable description of the location the initiative applies to'
    end

    let(:initiative) { build(:initiative) }
    let(:publication_status) { 'published' }
    let(:title_multiloc) { initiative.title_multiloc }
    let(:body_multiloc) { initiative.body_multiloc }

    example 'Toxicity detection job is enqueued when creating an initiative' do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      expect {
        do_request
      }.to have_enqueued_job(ToxicityDetectionJob)
    end
  end

  patch 'web_api/v1/initiatives/:id' do
    before do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      @initiative = create(:initiative, author: @user)
    end

    with_options scope: :initiative do
      parameter :title_multiloc, 'Multi-locale field with the initiative title', extra: 'Maximum 100 characters'
      parameter :body_multiloc, 'Multi-locale field with the initiative body', extra: 'Required if not draft'
      parameter :location_description, 'A human readable description of the location the initiative applies to'
      parameter :topic_ids, 'Array of ids of the associated topics'
    end

    let(:id) { @initiative.id }
    

    describe do
      let(:location_description) { 'Watkins Road 8' }

      example 'Toxicity detection job is enqueued when updating an initiative\'s title' do
        expect {
          do_request
        }.to have_enqueued_job(ToxicityDetectionJob).with(@initiative, attributes: [:location_description])
      end
    end

    describe do
      let(:topic_ids) { [create(:topic).id] }

      example 'No toxicity detection job is enqueued when updating initiative attributes without text' do
        expect {
          do_request
        }.not_to have_enqueued_job(ToxicityDetectionJob)
      end
    end
  end

end