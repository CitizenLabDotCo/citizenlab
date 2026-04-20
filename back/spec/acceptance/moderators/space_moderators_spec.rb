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
        expect(response_data.size).to eq 2
        expect(response_data.map { |d| d[:id] }).to match_array(space_moderators.map(&:id))
      end
    end

    get 'web_api/v1/spaces/:space_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator) { create(:space_moderator, spaces: [space]) }

      example 'Get one space moderator by id' do
        do_request space_id: space.id, user_id: moderator.id
        expect(status).to eq 200
        expect(response_data[:id]).to eq moderator.id
      end
    end

    post 'web_api/v1/spaces/:space_id/moderators' do
      with_options scope: :moderator do
        parameter :user_id, 'The id of user to become moderator.', required: false
        parameter :user_email, 'The email of user to become moderator.', required: false
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let(:user) { create(:user) }

      example 'Add a space moderator role to a user' do
        do_request space_id: space.id, moderator: { user_id: user.id }
        assert_status 200
        expect(response_data[:type]).to eq 'user'
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
        expect(response_data.size).to eq 3
        expect(response_data.map { |d| d[:id] }).to match_array(space_moderators.map(&:id) + [space_moderator.id])
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
        expect(response_data[:id]).to eq moderator.id
      end

      example '[error] Get one space moderator by id of a space not moderated by the user' do
        moderator_of_other_space = create(:space_moderator, spaces: [other_space])

        do_request space_id: other_space.id, user_id: moderator_of_other_space.id
        expect(status).to eq 401
      end
    end

    post 'web_api/v1/spaces/:space_id/moderators' do
      with_options scope: :moderator do
        parameter :user_id, 'The id of user to become moderator.', required: false
        parameter :user_email, 'The email of user to become moderator.', required: false
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let(:space_id) { space.id }

      shared_examples 'adding a moderator' do
        example_request 'Add a moderator role' do
          assert_status 200
          expect(response_data[:type]).to eq 'user'
          expect(LogActivityJob).to have_been_enqueued.with(test_user, 'space_moderation_rights_received', space_moderator, kind_of(Integer), payload: { space_id: space.id })
        end

        context 'with limited seats' do
          before do
            config = AppConfiguration.instance
            config.settings['core']['maximum_moderators_number'] = User.billed_moderators.count + 1
            config.settings['core']['additional_moderators_number'] = 0
            config.save!
          end

          context 'when limit is reached' do
            before { create(:space_moderator) } # to reach the limit

            example_request 'Increments additional seats', document: false do
              assert_status 200
              expect(AppConfiguration.instance.settings['core']['additional_moderators_number']).to eq(1)
            end
          end

          example_request 'Does not increment additional seats if limit is not reached', document: false do
            assert_status 200
            expect(AppConfiguration.instance.settings['core']['additional_moderators_number']).to eq(0)
          end
        end
      end

      context 'with user_id' do
        let(:test_user) { create(:user) }
        let(:user_id) { test_user.id }

        include_examples 'adding a moderator'
      end

      context 'with user_email' do
        let(:test_user) { create(:user) }
        let(:user_email) { test_user.email }

        include_examples 'adding a moderator'
      end
    end

    delete 'web_api/v1/spaces/:space_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator_of_same_space) { create(:space_moderator, spaces: [space]) }
      let(:moderator_of_other_space) { create(:space_moderator, spaces: [other_space]) }

      example "Remove a space moderator role from a user in the moderator's space" do
        n_roles_before = moderator_of_same_space.roles.size
        do_request space_id: space.id, user_id: moderator_of_same_space.id

        expect(response_status).to eq 200
        expect(moderator_of_same_space.reload.roles.size).to eq(n_roles_before - 1)
        expect(LogActivityJob).to have_been_enqueued.with(moderator_of_same_space, 'space_moderation_rights_removed', space_moderator, kind_of(Integer), payload: { space_id: space.id })
      end

      example '[Unauthorized] Remove a space moderator role from a user in a space not moderated by the user' do
        n_roles_before = moderator_of_other_space.roles.size
        do_request space_id: other_space.id, user_id: moderator_of_other_space.id

        expect(response_status).to eq 401
        expect(moderator_of_other_space.reload.roles.size).to eq(n_roles_before)
      end
    end
  end
end
