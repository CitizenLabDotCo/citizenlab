# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Spam Reports' do
  explanation 'Reporting undesired content (i.e. a comment).'

  before do
    @user = create(:admin)
    header_token_for @user
    header 'Content-Type', 'application/json'
    @comment = create(:comment)
    @spam_reports = create_list(:spam_report, 2, spam_reportable: @comment)
  end

  get 'web_api/v1/comments/:comment_id/spam_reports' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of spam reports per page'
    end

    let(:comment_id) { @comment.id }

    example_request 'List all spam reports of a comment' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/spam_reports/:id' do
    let(:id) { @spam_reports.first.id }

    example_request 'Get one spam report of a comment by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @spam_reports.first.id
    end
  end

  post 'web_api/v1/comments/:comment_id/spam_reports' do
    with_options scope: :spam_report do
      parameter :user_id, 'the user id of the user owning the spam report. Signed in user by default', required: false
      parameter :reason_code, 'one of [wrong_content, inappropriate, other]', required: true
      parameter :other_reason, "the reason for the spam report, if none of the reason codes is applicable, in which case 'other' must be chosen", required: false
    end
    ValidationErrorHelper.new.error_fields(self, SpamReport)

    let(:comment_id) { @comment.id }
    let(:reason_code) { 'other' }
    let(:other_reason) { 'plagiarism' }

    example_request 'Create a spam report for a comment' do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq @user.id
      expect(json_response.dig(:data, :attributes, :reason_code)).to eq 'other'
      expect(json_response.dig(:data, :attributes, :other_reason)).to eq 'plagiarism'
    end
  end

  patch 'web_api/v1/spam_reports/:id' do
    with_options scope: :spam_report do
      parameter :reason_code, 'one of [wrong_content, inappropriate, other]', required: true
      parameter :other_reason, "the reason for the spam report, if none of the reason codes is applicable, in which case 'other' must be chosen", required: false
    end
    ValidationErrorHelper.new.error_fields(self, SpamReport)

    let(:spam_report) { create(:spam_report, user: @user, spam_reportable: @comment, reason_code: 'other', other_reason: 'pagiarism') }
    let(:id) { spam_report.id }
    let(:reason_code) { 'inappropriate' }

    example_request 'Update a spam report for a comment' do
      expect(status).to be 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :reason_code)).to eq 'inappropriate'
    end
  end

  delete 'web_api/v1/spam_reports/:id' do
    let(:spam_report) { create(:spam_report, user: @user, spam_reportable: @comment) }
    let(:id) { spam_report.id }

    example_request 'Delete a spam report from a comment' do
      expect(response_status).to eq 200
      expect { SpamReport.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
