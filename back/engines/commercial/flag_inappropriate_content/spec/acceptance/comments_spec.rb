# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Comments' do
  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
  end

  post 'web_api/v1/ideas/:idea_id/comments' do
    before do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      @idea = create(:idea)
    end

    with_options scope: :comment do
      parameter :body_multiloc
    end

    let(:idea_id) { @idea.id }
    let(:comment) { build(:comment) }
    let(:body_multiloc) { comment.body_multiloc }

    example 'Toxicity detection job is enqueued when creating a comment', document: false do
      expect do
        do_request
      end.to have_enqueued_job(ToxicityDetectionJob)
    end
  end

  patch 'web_api/v1/comments/:id' do
    before do
      SettingsService.new.activate_feature! 'moderation'
      SettingsService.new.activate_feature! 'flag_inappropriate_content'
      @initiative = create(:initiative)
      @comment = create(:comment, author: @user, post: @initiative)
    end

    with_options scope: :comment do
      parameter :body_multiloc
    end

    let(:id) { @comment.id }
    let(:body_multiloc) { { 'en' => 'Changed body' } }

    example 'Toxicity detection job is enqueued when updating an comment\'s body', document: false do
      expect do
        do_request
      end.to have_enqueued_job(ToxicityDetectionJob).with(@comment, attributes: [:body_multiloc])
    end
  end
end
