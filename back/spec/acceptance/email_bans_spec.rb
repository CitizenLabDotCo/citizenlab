# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'EmailBans' do
  explanation 'Admin endpoints for managing banned email addresses'
  header 'Content-Type', 'application/json'

  context 'when admin' do
    before { admin_header_token }

    get 'web_api/v1/email_bans/count' do
      before do
        EmailBan.ban!('banned1@example.com')
        EmailBan.ban!('banned2@example.com')
      end

      example_request 'Get count of banned emails' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :count)).to eq 2
      end
    end

    get 'web_api/v1/email_bans' do
      parameter :email, 'Email address to check', required: true

      before do
        EmailBan.ban!('banned.user+test@gmail.com', reason: 'Spam account')
      end

      example 'Get ban details for a banned email' do
        do_request email: 'banneduser@gmail.com' # normalized match
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :reason)).to eq 'Spam account'
        expect(json_response.dig(:data, :attributes, :id)).to be_present
      end

      example 'Returns 404 for non-banned email' do
        do_request email: 'not_banned@example.com'
        assert_status 404
      end
    end

    delete 'web_api/v1/email_bans' do
      parameter :email, 'Email address to unban', required: true

      before do
        EmailBan.ban!('to_unban@example.com')
      end

      example 'Unban an email address' do
        expect { do_request email: 'to_unban@example.com' }
          .to change(EmailBan, :count).by(-1)
        assert_status 200
      end

      example 'Returns 404 when trying to unban non-banned email' do
        do_request email: 'not_banned@example.com'
        assert_status 404
      end
    end
  end

  context 'when not admin' do
    before { header_token_for create(:user) }

    get 'web_api/v1/email_bans/count' do
      example_request '[error] Regular user cannot access banned emails count' do
        assert_status 401
      end
    end

    get 'web_api/v1/email_bans' do
      example 'Regular user cannot check banned emails' do
        do_request email: 'test@example.com'
        assert_status 401
      end
    end
  end

  context 'when not logged in' do
    get 'web_api/v1/email_bans/count' do
      example_request '[error] Visitor cannot access banned emails count' do
        assert_status 401
      end
    end
  end
end
