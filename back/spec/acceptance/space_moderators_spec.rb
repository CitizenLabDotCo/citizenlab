require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain spaces.'

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
        space = create(:space)
        space_moderators = create_list(:space_moderator, 5, spaces: [space])
        other_space = create(:space)
        _other_space_moderator = create(:space_moderator, spaces: [other_space])

        do_request space_id: space.id
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data].map { |d| d[:id] }).to match_array(space_moderators.map(&:id))
      end
    end
  end

  context 'as a space moderator' do
    let(:space) { create(:space) }
    let(:space_moderator) { create(:space_moderator, spaces: [space]) }

    before do
      header_token_for(space_moderator)
    end

    get 'web_api/v1/spaces/:space_id/moderators' do
      example 'List all moderators of a space' do
        other_space = create(:space)
        _other_space_moderator = create(:space_moderator, spaces: [other_space])

        do_request space_id: space.id
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
        expect(json_response[:data][0][:id]).to eq(space_moderator.id)
      end
    end
  end
end
