require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  before do
    header 'Content-Type', 'application/json'
    @ideas = %w[published published draft published spam published published].map do |ps|
      create(:idea, publication_status: ps)
    end
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get 'web_api/v1/ideas' do
    parameter :assignee, 'Filter by assignee (user id)', required: false

    example_request 'List all ideas for an assignee' do
      a = create(:admin)
      i = create(:idea, assignee: a)

      do_request assignee: a.id
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq i.id
    end
  end

  get 'web_api/v1/ideas/as_markers' do
    parameter :assignee, 'Filter by assignee (user id)', required: false
  end

  get 'web_api/v1/ideas/filter_counts' do
    parameter :assignee, 'Filter by assignee (user id)', required: false
  end

  post 'web_api/v1/ideas' do
    with_options scope: :idea do
      parameter :assignee_id,
                'The user id of the admin/moderator that takes ownership. Set automatically if not provided. Only allowed for admins/moderators.'
    end
  end

  patch 'web_api/v1/ideas/:id' do
    before do
      @project = create(:continuous_project, with_permissions: true)
      @idea =  create(:idea, author: @user, project: @project)
    end

    with_options scope: :idea do
      parameter :assignee_id,
                'The user id of the admin/moderator that takes ownership. Only allowed for admins/moderators.'
    end

    let(:id) { @idea.id }

    let(:assignee_id) { create(:admin).id }

    example_request 'Changing the assignee as a non-admin does not work', document: false do
      expect(status).to be 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :relationships, :assignee)).to be_nil
    end

    context 'when moderator' do
      before do
        @moderator = create(:moderator, project: @project)
        token = Knock::AuthToken.new(payload: @moderator.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:assignee_id) { create(:admin).id }

      example_request 'Change the assignee (as a moderator)' do
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq assignee_id
      end
    end

    context 'when admin' do
      before do
        @user = create(:admin)
        token = Knock::AuthToken.new(payload: @user.to_token_payload).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:assignee_id) { create(:admin).id }

      example_request 'Change the assignee (as an admin)' do
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :assignee, :data, :id)).to eq assignee_id
      end
    end
  end
end
