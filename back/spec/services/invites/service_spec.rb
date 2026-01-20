# frozen_string_literal: true

require 'rails_helper'

describe Invites::Service do
  let(:service) { described_class.new }
  let(:service_errors) { service.instance_variable_get(:@error_storage).instance_variable_get(:@errors) }

  before do
    settings = AppConfiguration.instance.settings
    settings['core']['locales'] = %w[fr-BE en nl-BE]
    AppConfiguration.instance.update(settings: settings)
  end

  describe 'bulk_create_xlsx' do
    let(:xlsx) { Base64.encode64(XlsxService.new.hash_array_to_xlsx(hash_array).read) }

    context do
      let(:service) { described_class.new(inviter) }
      let!(:inviter) { create(:user) }
      let!(:groups) { create_list(:group, 3) }
      let(:users) { build_list(:user, 10) }
      let(:hash_array) do
        (users.map do |user|
          {
            email: user.email,
            first_name: rand(3) == 0 ? user.first_name : nil,
            last_name: rand(3) == 0 ? user.last_name : nil,
            language: rand(3) == 0 ? user.locale : nil,
            admin: rand(5) == 0 ? true : nil,
            groups: rand(3) == 0 ? Array.new(rand(3)) { Group.offset(rand(Group.count)).first.title_multiloc.values.first }.uniq.join(',') : nil
          }
        end + [{}, {}, {}]).shuffle
      end

      it 'correctly creates invites when all is fine' do
        expect do
          service.bulk_create_xlsx(xlsx, {})
        end.to change(Invite, :count).from(0).to(10)
          .and change(User, :count).by(10)

        invites = Invite.includes(:invitee, :inviter).to_a
        expect(invites.map(&:invitee)).to match_array(User.all.to_a - [inviter])
        invites.each { |invite| expect(invite.inviter).to eq(inviter) }
      end
    end

    context 'when inviter is blank' do
      let(:hash_array) { [{ email: 'test@email.com' }] }

      it 'creates invite with blank inviter' do
        expect do
          service.bulk_create_xlsx(xlsx, {})
        end.to change(Invite, :count).from(0).to(1)
          .and change(User, :count).from(0).to(1)

        expect(Invite.first.inviter).to be_nil
      end
    end

    context 'when additional seats are incremented' do
      let(:hash_array) do
        [
          { email: 'user@domain.net' }
        ]
      end

      before do
        config = AppConfiguration.instance
        config.settings['core']['maximum_admins_number'] = 1
        config.settings['core']['maximum_moderators_number'] = 1
        config.settings['core']['additional_admins_number'] = 0
        config.settings['core']['additional_moderators_number'] = 0
        config.save!
      end

      it 'increments additional moderator seats' do
        create(:project_moderator) # to reach limit

        expect(LogActivityJob).to receive(:perform_later)
        new_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
        expect do
          service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })
        end.to change(Invite, :count).from(0).to(1)
          .and(not_change { AppConfiguration.instance.settings['core']['additional_admins_number'] })
          .and(change { AppConfiguration.instance.settings['core']['additional_moderators_number'] }.from(0).to(1))
      end

      it 'increments additional admin seats' do
        create(:admin)
        new_role = { 'type' => 'admin' }
        expect do
          service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })
        end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(0).to(1)
          .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
      end

      it 'does not increment additional seats if limit is not reached' do
        new_role = { 'type' => 'admin' }
        expect do
          service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })
        end.to not_change { AppConfiguration.instance.settings['core']['additional_admins_number'] }
          .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
      end

      context 'when updating existing user' do
        before do
          create(:project_moderator, email: hash_array.first[:email])
        end

        it 'does not increment additional seats if new moderator role was added to moderator' do
          # limit is already reached
          new_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
          expect do
            service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })
          end.to not_change { AppConfiguration.instance.settings['core']['additional_admins_number'] }
            .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
        end

        it 'increments additional seats if admin role was added to moderator' do
          create(:admin) # to reach limit
          new_role = { 'type' => 'admin' }
          expect do
            service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })
          end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(0).to(1)
            .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
        end
      end

      context 'when both admin and moderator seats are incremented' do
        let(:hash_array) do
          [
            { email: 'admin@domain.net', admin: 'TRUE' },
            { email: 'moder@domain.net' }
          ]
        end

        it 'increments both kinds of additional seats' do
          create(:project_moderator) # to reach limit
          create(:admin) # to reach limit
          new_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
          expect do
            service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })
          end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(0).to(1)
            .and(change { AppConfiguration.instance.settings['core']['additional_moderators_number'] }.from(0).to(1))
        end

        it 'logs activity with correct user' do
          ActiveJob::Base.queue_adapter.enqueued_jobs = []

          create(:project_moderator) # to reach limit
          create(:admin) # to reach limit
          new_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
          service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })

          additional_moder_job = ActiveJob::Base.queue_adapter.enqueued_jobs.find do |job|
            job['job_class'] == 'LogActivityJob' && job['arguments'][1] == 'additional_moderators_number_incremented'
          end
          additional_admin_job = ActiveJob::Base.queue_adapter.enqueued_jobs.find do |job|
            job['job_class'] == 'LogActivityJob' && job['arguments'][1] == 'additional_admins_number_incremented'
          end
          additional_moder = GlobalID::Locator.locate(additional_moder_job['arguments'][0]['_aj_globalid'])
          additional_admin = GlobalID::Locator.locate(additional_admin_job['arguments'][0]['_aj_globalid'])

          expect(additional_moder.email).to eq('moder@domain.net')
          expect(additional_admin.email).to eq('admin@domain.net')
        end
      end

      context 'when adding one more moderator role to existing user' do
        let(:hash_array) do
          [
            { email: 'user1@domain.net' },
            { email: 'user2@domain.net' }
          ]
        end

        shared_examples 'logs activity with correct user' do
          it 'logs activity with correct user' do
            ActiveJob::Base.queue_adapter.enqueued_jobs = []

            new_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
            expect do
              service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })
            end.to change { AppConfiguration.instance.settings['core']['additional_moderators_number'] }.from(0).to(1)

            additional_moder_job = ActiveJob::Base.queue_adapter.enqueued_jobs.find do |job|
              job['job_class'] == 'LogActivityJob' && job['arguments'][1] == 'additional_moderators_number_incremented'
            end
            additional_moder = GlobalID::Locator.locate(additional_moder_job['arguments'][0]['_aj_globalid'])

            expect(additional_moder.email).to eq('user2@domain.net') # the first user has already had a role before
          end
        end

        context 'when existing user is moderator' do
          before do
            create(:project_moderator, email: 'user1@domain.net') # to reach limit
          end

          it_behaves_like 'logs activity with correct user'
        end

        context 'when existing user is admin' do
          before do
            create(:project_moderator) # to reach limit
            create(:admin, email: 'user1@domain.net')
          end

          it_behaves_like 'logs activity with correct user'
        end
      end

      # If the implementation is wrong (e.g., if we call after_* sideFx in the same iteraion as save!),
      # making user2@domain.net a moderator can cause increment of
      # additional_moderators_number before decrementing total number of moderators by changing user@domain.net
      # from moderator to admin.
      context 'when two users are updated, but only admin seats should be incremented' do
        let(:hash_array) do
          [
            { email: 'user2@domain.net' },
            { email: 'user@domain.net', admin: 'TRUE' } # the order is important for the test. Admin should go after moderator
          ]
        end

        it 'increments admin additional seats' do
          create(:project_moderator, email: 'user@domain.net')
          create(:admin) # to reach limit

          new_role = { 'type' => 'project_moderator', 'project_id' => create(:project).id }
          expect do
            service.bulk_create_xlsx(xlsx, { 'roles' => [new_role] })
          end.to change { AppConfiguration.instance.settings['core']['additional_admins_number'] }.from(0).to(1)
            .and(not_change { AppConfiguration.instance.settings['core']['additional_moderators_number'] })
        end
      end
    end

    context 'with user custom fields configured' do
      before do
        create(
          :custom_field,
          key: 'text_field',
          input_type: 'text',
          title_multiloc: { 'en' => 'size', 'nl-NL' => 'grootte' },
          description_multiloc: { 'en' => 'How big is it?', 'nl-NL' => 'Hoe groot is het?' }
        )
        create(
          :custom_field,
          key: 'checkbox_field',
          input_type: 'checkbox'
        )
        create(
          :custom_field,
          key: 'float_field',
          input_type: 'number'
        )
        create(
          :custom_field,
          key: 'integer_field',
          input_type: 'number'
        )
      end

      let(:hash_array) do
        [
          { email: 'user1@domain.net', text_field: 'some_value' },

          { email: 'user2@domain.net', checkbox_field: '1' },
          { email: 'user3@domain.net', checkbox_field: 'true' },
          { email: 'user4@domain.net', checkbox_field: 0 },
          { email: 'user5@domain.net', checkbox_field: 'FALSE' },

          { email: 'user6@domain.net', float_field: '666.34' },
          { email: 'user7@domain.net', integer_field: '1873050293742134' }
        ]
      end

      it 'initializes custom_field_values with matching column names and appropriate types' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to change(Invite, :count).from(0).to(7)

        user = User.find_by(email: 'user1@domain.net')
        expect(user.custom_field_values).to eq({ 'text_field' => 'some_value' })

        user = User.find_by(email: 'user2@domain.net')
        expect(user.custom_field_values).to eq({ 'checkbox_field' => true })

        user = User.find_by(email: 'user3@domain.net')
        expect(user.custom_field_values).to eq({ 'checkbox_field' => true })

        user = User.find_by(email: 'user4@domain.net')
        expect(user.custom_field_values).to eq({ 'checkbox_field' => false })

        user = User.find_by(email: 'user5@domain.net')
        expect(user.custom_field_values).to eq({ 'checkbox_field' => false })

        user = User.find_by(email: 'user6@domain.net')
        expect(user.custom_field_values).to eq({ 'float_field' => 666.34 })

        user = User.find_by(email: 'user7@domain.net')
        expect(user.custom_field_values).to eq({ 'integer_field' => 1_873_050_293_742_134 })
      end
    end

    context 'when email has leading spaces' do
      let(:hash_array) do
        [
          { email: '   user@domain.net' }
        ]
      end

      it 'trims the spaces' do
        expect { service.bulk_create_xlsx(xlsx) }.to change(User, :count).from(0).to(1)
        expect(User.first.email).to eq('user@domain.net')
      end
    end

    context 'when email has trailing spaces' do
      let(:hash_array) do
        [
          { email: 'user@domain.net   ' }
        ]
      end

      it 'trims the spaces' do
        expect { service.bulk_create_xlsx(xlsx) }.to change(User, :count).from(0).to(1)
        expect(User.first.email).to eq('user@domain.net')
      end
    end

    context 'with custom field that has the wrong type' do
      before do
        create(:custom_field,
          key: 'checkbox_field',
          input_type: 'checkbox')
        create(:custom_field,
          key: 'number_field',
          input_type: 'number')
      end

      let(:hash_array) do
        [
          { email: 'user1@domain.net', number_field: 'nan' },
          { email: 'user2@domain.net', checkbox_field: 'non-truthy' }
        ]
      end

      it "raises 'Invites::InviteError' errors" do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error do |e|
          expect(e).to be_a(Invites::FailedError)
          expect(e.errors.length).to eq(2)

          error = e.errors[0]
          expect(error).to be_a(Invites::InviteError)
          expect(error.error_key).to eq('malformed_custom_field_value')
          expect(error.value).to eq('nan')

          error = e.errors[1]
          expect(error).to be_a(Invites::InviteError)
          expect(error.error_key).to eq('malformed_custom_field_value')
          expect(error.value).to eq('non-truthy')
        end
      end
    end

    context 'with file that exceeds maximum supported number of invites' do
      let(:hash_array) { (Invites::Service::MAX_INVITES + 1).times.each.map { { first_name: 'Jezus' } } }

      it 'fails with max_invites_limit_exceeded error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)
        expect(service_errors.size).to eq 1
        expect(service_errors.first.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:max_invites_limit_exceeded]
      end
    end

    context 'with no invites specified' do
      let(:hash_array) { [] }

      it 'fails with no_invites_specified error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)
        expect(service_errors.size).to eq 1
        expect(service_errors.first.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:no_invites_specified]
      end
    end

    context 'with a reference to a non-existing group' do
      let(:hash_array) do
        [
          { groups: "The Jackson 5, #{create(:group).title_multiloc.values.first}" }
        ]
      end

      it 'fails with unknown_group error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)
        expect(service_errors.size).to eq 1
        expect(service_errors.first.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:unknown_group]
        expect(service_errors.first.row).to eq 2
        expect(service_errors.first.value).to eq 'The Jackson 5'
      end
    end

    context 'with a malformed groups field' do
      let(:hash_array) do
        [
          {},
          { groups: 24 }
        ]
      end

      it 'fails with malformed_groups_value error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)
        expect(service_errors.size).to eq 1
        expect(service_errors.first.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:malformed_groups_value]
        expect(service_errors.first.row).to eq 3
        expect(service_errors.first.value).to eq 24
      end
    end

    context 'with a malformed admin field' do
      let(:hash_array) do
        [
          { admin: 'yup' }
        ]
      end

      it 'fails with malformed_admin_value error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)
        expect(service_errors.size).to eq 1
        expect(service_errors.first.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:malformed_admin_value]
        expect(service_errors.first.row).to eq 2
        expect(service_errors.first.value).to eq 'yup'
      end
    end

    context 'with an unknown language value' do
      let(:hash_array) do
        [
          { language: 'qq' }
        ]
      end

      it 'fails with unknown_locale error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)
        expect(service_errors.size).to eq 1
        expect(service_errors.first.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:unknown_locale]
        expect(service_errors.first.row).to eq 2
        expect(service_errors.first.value).to eq 'qq'
      end
    end

    context 'with an invalid email field' do
      let(:hash_array) do
        [
          { email: 'this.can\'t be an email' }
        ]
      end

      it 'fails with invalid_email error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)
        expect(service_errors.size).to eq 1
        expect(service_errors.first.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:invalid_email]
        expect(service_errors.first.row).to eq 2
        expect(service_errors.first.value).to eq 'this.can\'t be an email'
      end
    end

    context 'with a banned email' do
      before { EmailBan.ban!('banned.user@gmail.com') }

      let(:hash_array) do
        [
          { email: 'john@john.son' },
          { email: 'banned.user+alias@gmail.com' }
        ]
      end

      it 'fails with email_banned error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)

        error = service_errors.sole
        expect(error.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:email_banned]
        expect(error.row).to eq 3
      end
    end

    context 'with an email that is already used by an active user (case insensitive)' do
      before { create(:user, email: 'someUser@somedomain.com') }

      let(:hash_array) do
        [
          { email: 'john@john.son' },
          { email: 'Someuser@somedomain.com' }
        ]
      end

      it "doesn't send out invitations to the existing users" do
        expect { service.bulk_create_xlsx(xlsx) }.to change(Invite, :count).from(0).to(1)
      end
    end

    context 'with an email that is already used by a user with roles and groups' do
      let!(:user) do
        create(:user, email: 'someUser@somedomain.com', roles: [old_role], manual_groups: [old_group])
      end
      let(:old_role) { { 'type' => 'project_moderator', 'project_id' => create(:project).id } }
      let(:old_group) { create(:group) }
      let(:new_group) { create(:group) }

      let(:hash_array) do
        [
          { email: 'john@john.son' },
          { email: 'Someuser@somedomain.com', admin: 'true', groups: new_group.title_multiloc.values.first }
        ]
      end

      it 'adds roles and groups to user' do
        expect { service.bulk_create_xlsx(xlsx) }.to change(Invite, :count).from(0).to(1)

        user.reload
        expect(user.roles).to contain_exactly({ 'type' => 'admin' }, old_role)
        expect(user.manual_groups).to contain_exactly(old_group, new_group)
      end

      context 'when new role and group duplicate existing ones' do
        let(:hash_array) do
          [
            { email: 'john@john.son' },
            { email: 'Someuser@somedomain.com', groups: old_group.title_multiloc.values.first }
          ]
        end

        it 'does not duplicate roles and groups' do
          # using ActionController::Parameters helps catch some bugs
          default_params = ActionController::Parameters.new(roles: [old_role]).permit!
          expect { service.bulk_create_xlsx(xlsx, default_params) }.to change(Invite, :count).from(0).to(1)

          user.reload
          expect(user.roles).to contain_exactly(old_role)
          expect(user.manual_groups).to contain_exactly(old_group)
        end
      end
    end

    context 'with an email that is already invited' do
      let!(:invite) { create(:invite) }
      let(:hash_array) do
        [
          { email: invite.invitee.email }
        ]
      end

      it "doesn't send out invitations to the invited users" do
        expect { service.bulk_create_xlsx(xlsx) }.not_to change(Invite, :count)
        expect(Invite.count).to eq 1
      end
    end

    context 'with duplicate emails' do
      let(:hash_array) do
        [
          { email: 'someuser@somedomain.com' },
          { email: 'someuser@somedomain.com' },
          {},
          { email: 'someuser@somedomain.com' }
        ]
      end

      it 'fails with email_duplicate error' do
        expect { service.bulk_create_xlsx(xlsx, {}) }.to raise_error(Invites::FailedError)
        expect(service_errors.size).to eq 1
        expect(service_errors.first.error_key).to eq Invites::ErrorStorage::INVITE_ERRORS[:emails_duplicate]
        expect(service_errors.first.rows).to eq [2, 3, 5]
        expect(service_errors.first.value).to eq 'someuser@somedomain.com'
      end
    end

    context 'with duplicate first and last names' do
      let(:hash_array) do
        [
          { first_name: 'John', last_name: 'Johnson' },
          { first_name: 'John', last_name: 'Johnson' }
        ]
      end

      it 'succeeds with unique slugs' do
        expect { service.bulk_create_xlsx(xlsx) }.to change(Invite, :count).from(0).to(2)
      end
    end

    context 'with send_invite_email set to false' do
      let(:hash_array) do
        [
          { email: 'test1@example.com', send_invite_email: 'FALSE' },
          { email: 'test2@example.com', send_invite_email: '0' },
          { email: 'test3@example.com', send_invite_email: 'false' }
        ]
      end

      it 'sets send_invite_email attribute to false in the invite' do
        expect { service.bulk_create_xlsx(xlsx) }.to change(Invite, :count).from(0).to(3)
        expect(Invite.all.pluck(:send_invite_email)).to eq [false, false, false]
      end
    end

    context 'with send_invite_email set to true' do
      let(:hash_array) do
        [
          { email: 'test1@example.com', send_invite_email: 'TRUE' },
          { email: 'test2@example.com', send_invite_email: '1' },
          { email: 'test3@example.com', send_invite_email: 'true' }
        ]
      end

      it 'sets send_invite_email attribute to true in the invite' do
        expect { service.bulk_create_xlsx(xlsx) }.to change(Invite, :count).from(0).to(3)
        expect(Invite.all.pluck(:send_invite_email)).to eq [true, true, true]
      end
    end

    context 'with send_invite_email missing' do
      let(:hash_array) do
        [
          { email: 'test1@example.com' }
        ]
      end

      it 'sets send_invite_email attribute to true in the invite' do
        expect { service.bulk_create_xlsx(xlsx) }.to change(Invite, :count).from(0).to(1)
        expect(Invite.first.send_invite_email).to be true
      end
    end

    context 'when abbreviated user names feature is enabled' do
      let(:email) { 'someone@email.com' }
      let(:hash_array) do
        [{
          email: email,
          first_name: SecureRandom.hex(4).to_s,
          last_name: SecureRandom.hex(4).to_s,
          language: 'en'
        }]
      end

      before do
        SettingsService.new.activate_feature! 'abbreviated_user_names'
        service.bulk_create_xlsx(xlsx)
      end

      it 'anonymizes user slugs' do
        user = User.find_by(email: email)
        expect(user.slug).not_to include user.last_name
      end
    end
  end

  describe 'bulk_create' do
    let(:test_email1) { 'find_me_1@test.com' }
    let(:test_email2) { 'find_me_2@test.com' }
    let(:hash_array) do
      [
        { 'email' => test_email1 },
        { 'email' => test_email2 }
      ]
    end

    context 'with multiple emails and no names' do
      it 'creates users with no slugs' do
        service.bulk_create(hash_array, _default_params = {})

        expect(User.find_by(email: test_email1).slug).to be_nil
        expect(User.find_by(email: test_email2).slug).to be_nil
      end
    end
  end
end
