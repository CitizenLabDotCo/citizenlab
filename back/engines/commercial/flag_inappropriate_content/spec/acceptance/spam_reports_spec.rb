# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Spam Reports' do
  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
  end

  post 'web_api/v1/ideas/:idea_id/spam_reports' do
    with_options scope: :spam_report do
      parameter :user_id
      parameter :reason_code
      parameter :other_reason
    end

    let(:idea) { create(:idea) }
    let(:idea_id) { idea.id }
    let(:reason_code) { 'wrong_content' }

    describe do
      before { idea.inappropriate_content_flag&.destroy! }

      example 'A new flag is created when spam is reported', document: false do
        do_request
        expect(response_status).to eq 201
        expect(idea.reload.inappropriate_content_flag).to be_present
      end
    end

    describe do
      before { create(:inappropriate_content_flag, flaggable: idea) }

      example 'The exisiting flag is reused when spam is reported', document: false do
        count = FlagInappropriateContent::InappropriateContentFlag.count
        do_request
        expect(response_status).to eq 201
        expect(FlagInappropriateContent::InappropriateContentFlag.count).to eq count
      end
    end
  end

  delete 'web_api/v1/spam_reports/:id' do
    let(:idea) { create(:idea) }
    let(:spam_report) { create(:spam_report, user: @user, spam_reportable: idea) }
    let(:id) { spam_report.id }

    example 'Deleting a spam report also deletes the flag', document: false do
      create(:inappropriate_content_flag, flaggable: idea, toxicity_label: nil)
      do_request
      expect(response_status).to eq 200
      expect(idea.reload.inappropriate_content_flag).to be_blank
    end

    example 'Deleting a spam report does not delete the flag when toxicity was detected', document: false do
      create(:inappropriate_content_flag, flaggable: idea, toxicity_label: 'obscene')
      do_request
      expect(response_status).to eq 200
      expect(idea.reload.inappropriate_content_flag).to be_present
    end

    example 'Deleting a spam report does not delete the flag when there other spam reports remain', document: false do
      create(:inappropriate_content_flag, flaggable: idea, toxicity_label: nil)
      create(:spam_report, spam_reportable: idea)
      do_request
      expect(response_status).to eq 200
      expect(idea.reload.inappropriate_content_flag).to be_present
    end

    example 'Deleting a spam report when there is no flag', document: false do
      idea.inappropriate_content_flag&.destroy!
      do_request
      expect(response_status).to eq 200
    end
  end
end
