require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Moderators' do
  explanation 'Space moderators can manage items (e.g. folder, project, phase, idea) and other moderators (e.g. folder moderators, project moderators) in their space.'

  let!(:space) { create(:space) }
  let!(:other_space) { create(:space) }

  let!(:space_moderators) { create_list(:space_moderator, 2, spaces: [space]) }
  let!(:other_space_moderator) { create(:space_moderator, spaces: [other_space]) }

  before do
    header 'Content-Type', 'application/json'
  end

  context 'as an admin' do
    let(:admin) { create(:admin) }

    before do
      header_token_for(admin)
    end

    get 'web_api/v1/spaces/:space_id/moderators' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end

      example 'List all moderators of a space' do
        do_request space_id: space.id
        expect(status).to eq(200)

        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d[:id] }).to match_array(space_moderators.map(&:id))
      end
    end
  end

  context 'as a space moderator' do
    let(:space_moderator) { create(:space_moderator, spaces: [space]) }

    before do
      header_token_for(space_moderator)
    end

    get 'web_api/v1/spaces/:space_id/moderators' do
      example 'List all moderators of a space' do
        do_request space_id: space.id
        expect(status).to eq(200)

        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map { |d| d[:id] }).to match_array(space_moderators.map(&:id) + [space_moderator.id])
      end

      example "[error] List all moderators of a space not moderated by the user" do
        do_request space_id: other_space.id
        expect(status).to eq(401)
      end
    end
  end
end
