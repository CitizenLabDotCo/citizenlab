require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'InvitesImports' do
  header 'Content-Type', 'application/json'

  shared_examples 'a request by an unauthorized user' do
    get 'web_api/v1/invites_imports/:id' do
      example_request 'Unauthorized user cannot get an invites_import by id' do
        expect(status).to eq 401
      end
    end
  end

  let(:invites_import1) do
    create(
      :invites_import,
      result: {
        newly_added_admins_number: 9,
        newly_added_moderators_number: 0
      },
      job_type: 'count_new_seats_xlsx',
      completed_at: Time.zone.now
    )
  end

  let(:_invites_import2) { create(:invites_import) }
  let(:id) { invites_import1.id }

  context 'when admin' do
    before { admin_header_token }

    get 'web_api/v1/invites_imports/:id' do
      example_request 'Get one invites_import by id' do
        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq(id)
        expect(json_response.dig(:data, :attributes, :result)).to eq(
          newly_added_admins_number: 9,
          newly_added_moderators_number: 0
        )
        expect(json_response.dig(:data, :attributes, :job_type)).to eq('count_new_seats_xlsx')
        expect { Time.iso8601(json_response.dig(:data, :attributes, :completed_at)) }.not_to raise_error
      end
    end
  end

  context 'when project moderator' do
    before do
      moderator = create(:project_moderator)
      header_token_for(moderator)
    end

    it_behaves_like 'a request by an unauthorized user'
  end

  context 'when regular user' do
    before do
      user = create(:user)
      header_token_for(user)
    end

    it_behaves_like 'a request by an unauthorized user'
  end

  context 'when not logged in' do
    it_behaves_like 'a request by an unauthorized user'
  end
end
