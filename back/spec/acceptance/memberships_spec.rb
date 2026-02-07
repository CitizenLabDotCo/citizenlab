# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Memberships' do
  explanation 'Memberships are associations between groups and users.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'CRUD memberships' do
    before do
      @group = create(:group)
      @users = create_list(:user, 5)
      @memberships = @users.map { |u| create(:membership, group: @group, user: u) }
      admin_header_token
    end

    get 'web_api/v1/groups/:group_id/memberships' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end
      let(:group_id) { @group.id }

      example_request 'List all members of a group' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
      end
    end

    get 'web_api/v1/memberships/:id' do
      let(:id) { @memberships.first.id }

      example_request 'Get one membership by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @memberships.first.id
      end
    end

    get 'web_api/v1/groups/:group_id/memberships/by_user_id/:user_id' do
      let(:membership) { create(:membership) }
      let(:group_id) { membership.group.id }
      let(:user_id) { membership.user.id }
      example_request 'Get one membership by group id and user id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq membership.id
      end
    end

    post 'web_api/v1/groups/:group_id/memberships' do
      with_options scope: :membership do
        parameter :user_id, 'The user id of the group member.', required: true
      end
      ValidationErrorHelper.new.error_fields(self, Membership)
      let(:group_id) { @group.id }
      let(:user_id) { create(:user).id }

      example_request 'Add a group member' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq user_id
        expect(@group.reload.memberships_count).to eq 6
      end
    end

    delete 'web_api/v1/memberships/:id' do
      let(:membership) { create(:membership) }
      let(:id) { membership.id }

      example_request 'Delete a membership' do
        expect(response_status).to eq 200
        expect { Membership.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    delete 'web_api/v1/groups/:group_id/memberships/by_user_id/:user_id' do
      let(:membership) { create(:membership) }
      let(:group_id) { membership.group.id }
      let(:user_id) { membership.user.id }
      example_request 'Delete a membership by group id and user id' do
        expect(response_status).to eq 200
        expect { Membership.find(membership.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  context 'Users search' do
    before do
      @admin = create(:admin, first_name: 'Freddy', last_name: 'Smith', email: 'superadmin@gmail.com')
      header_token_for @admin
    end

    get 'web_api/v1/groups/:group_id/memberships/users_search' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end
      parameter :search, 'The query used for searching users', required: true

      let(:g1) { create(:group) }
      let(:group_id) { g1.id }
      let(:g2) { create(:group) }
      let(:search) { 'jo' }
      let!(:u1) { create(:user, first_name: 'Freddy', last_name: 'Smith', email: 'jofreddy@jojo.com', manual_groups: [g1]) }
      let!(:u2) { create(:user, first_name: 'Jon', last_name: 'Smith', email: 'freddy1@zmail.com', manual_groups: [g2]) }
      let!(:u3) { create(:user, first_name: 'Jonny', last_name: 'Johnson', email: 'freddy2@zmail.com', manual_groups: []) }
      let!(:u4) { create(:user, first_name: 'Freddy', last_name: 'Johnson', email: 'freddy3@zmail.com', manual_groups: [g1, g2]) }
      let!(:u5) { create(:user, first_name: 'Freddy', last_name: 'Smith', email: 'freddy4@zmail.com', manual_groups: [g1]) }

      example_request 'Search for users and see whether or not they are member of the group' do
        expect(status).to eq(200)
        expect(response_data).not_to include(hash_including(id: u5.id))
        expect(response_data).to include(
          hash_including(id: u1.id, attributes: hash_including(is_member: true)),
          hash_including(id: u2.id, attributes: hash_including(is_member: false)),
          hash_including(id: u3.id, attributes: hash_including(is_member: false)),
          hash_including(id: u4.id, attributes: hash_including(is_member: true))
        )
      end
    end
  end

  post 'web_api/v1/groups/:group_id/memberships' do
    context 'when admin' do
      before do
        admin_header_token
        @group = create(:group)
      end

      with_options scope: :membership do
        parameter :user_id, 'The user id of the group member.', required: true
      end
      ValidationErrorHelper.new.error_fields(self, Membership)
      let(:group_id) { @group.id }
      let(:user_id) { create(:invited_user).id }

      example 'Add an invitee as a group member', document: false do
        do_request
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :relationships, :user, :data, :id)).to eq user_id
      end
    end
  end
end
