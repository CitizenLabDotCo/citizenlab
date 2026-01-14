# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative 'shared/errors_examples'

resource 'EmailBans' do
  explanation 'Admin endpoints for managing banned email addresses'
  header 'Content-Type', 'application/json'

  before_all do
    EmailBan.ban!('banned1@example.com')
    EmailBan.ban!('banned2@example.com')
    EmailBan.ban!('to_unban@example.com')
    EmailBan.ban!('banned.user+test@gmail.com', reason: 'Spam account')
  end

  get 'web_api/v1/email_bans/count' do
    context 'when admin' do
      before { admin_header_token }

      example_request 'Get count of banned emails' do
        assert_status 200
        expect(response_data.dig(:attributes, :count)).to eq(4)
      end
    end

    context 'when not admin' do
      before { header_token_for create(:user) }

      include_examples 'unauthorized'
    end

    context 'when not logged in' do
      include_examples 'unauthorized'
    end
  end

  get 'web_api/v1/email_bans/:email' do
    context 'when admin' do
      before { admin_header_token }

      describe 'for a banned email' do
        let(:email) { 'banneduser@gmail.com' } # normalized match

        example_request 'Get ban details' do
          assert_status 200

          expect(response_data).to match(
            id: be_a(String),
            type: 'email_ban',
            attributes: {
              reason: 'Spam account',
              created_at: be_a(String)
            },
            relationships: { banned_by: { data: nil } }
          )
        end
      end

      describe 'for a non-banned email' do
        let(:email) { 'not_banned@example.com' }

        include_examples 'not_found'
      end
    end

    context 'when not admin' do
      before { header_token_for create(:user) }

      let(:email) { 'test@example.com' }

      include_examples 'unauthorized'
    end
  end

  delete 'web_api/v1/email_bans/:email' do
    context 'when admin' do
      before { admin_header_token }

      describe 'for a banned email' do
        let(:email) { 'to_unban@example.com' }

        example 'Unban an email address' do
          expect { do_request }
            .to change { EmailBan.banned?(email) }.from(true).to(false)
          assert_status 200
        end
      end

      describe 'for a non-banned email' do
        let(:email) { 'not_banned@example.com' }

        include_examples 'not_found'
      end
    end

    context 'when not admin' do
      before { header_token_for create(:user) }

      let(:email) { 'to_unban@example.com' }

      include_examples 'unauthorized'
    end

    context 'when not logged in' do
      let(:email) { 'to_unban@example.com' }

      include_examples 'unauthorized'
    end
  end
end
