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

    get 'web_api/v1/spaces/:space_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator) { create(:space_moderator, spaces: [space]) }

      example 'Get one space moderator by id' do
        do_request space_id: space.id, user_id: moderator.id
        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq moderator.id
      end
    end

    post 'web_api/v1/spaces/:space_id/moderators' do
      with_options scope: :space_moderator do
        parameter :user_id, 'The id of user to become moderator (the id of the moderator will be the same).', required: true
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let(:user) { create(:user) }

      example 'Add a space moderator role to a user' do
        do_request space_id: space.id, space_moderator: { user_id: user.id }
        expect(response_status).to eq 201

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq user.id
        expect(user.reload.roles).to eq([{ 'type' => 'space_moderator', 'space_id' => space.id }])
        expect(LogActivityJob).to have_been_enqueued.with(user, 'space_moderation_rights_received', admin, kind_of(Integer), payload: { space_id: space.id })
      end
    end

    delete 'web_api/v1/spaces/:space_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator) { create(:space_moderator, spaces: [space]) }

      example 'Remove a space moderator role from a user' do
        do_request space_id: space.id, user_id: moderator.id
        expect(response_status).to eq 200

        expect(moderator.reload.roles).to eq []
        expect(LogActivityJob).to have_been_enqueued.with(moderator, 'space_moderation_rights_removed', admin, kind_of(Integer), payload: { space_id: space.id })
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

      example '[error] List all moderators of a space not moderated by the user' do
        do_request space_id: other_space.id
        expect(status).to eq(401)
      end
    end

    get 'web_api/v1/spaces/:space_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator) { create(:space_moderator, spaces: [space]) }

      example 'Get one space moderator by id' do
        do_request space_id: space.id, user_id: moderator.id
        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq moderator.id
      end

      example '[error] Get one space moderator by id of a space not moderated by the user' do
        moderator_of_other_space = create(:space_moderator, spaces: [other_space])

        do_request space_id: other_space.id, user_id: moderator_of_other_space.id
        expect(status).to eq 401
      end
    end

    post 'web_api/v1/spaces/:space_id/moderators' do
      with_options scope: :space_moderator do
        parameter :user_id, 'The id of user to become moderator (the id of the moderator will be the same).', required: true
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let(:user) { create(:user) }

      example 'Add a space moderator role to a user' do
        do_request space_id: space.id, space_moderator: { user_id: user.id }
        expect(response_status).to eq 201

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq user.id
        expect(user.reload.roles).to eq([{ 'type' => 'space_moderator', 'space_id' => space.id }])
        expect(LogActivityJob).to have_been_enqueued.with(user, 'space_moderation_rights_received', space_moderator, kind_of(Integer), payload: { space_id: space.id })
      end

      example '[error] Add a space moderator role to a user of a space not moderated by the user' do
        do_request space_id: other_space.id, space_moderator: { user_id: user.id }
        expect(response_status).to eq 401
      end
    end

    delete 'web_api/v1/spaces/:space_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator) { create(:space_moderator, spaces: [space]) }

      example '[error] Remove a space moderator role from a user' do
        do_request space_id: space.id, user_id: moderator.id
        expect(response_status).to eq 401

        expect(moderator.reload.roles).to eq([{ 'type' => 'space_moderator', 'space_id' => space.id }])
      end
    end
  end
end
