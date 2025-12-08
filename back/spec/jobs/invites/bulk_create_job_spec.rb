require 'rails_helper'

RSpec.describe Invites::BulkCreateJob do
  describe '#perform' do
    let!(:emails) { Array.new(5) { Faker::Internet.email }.push(nil) }
    let(:group_ids) { [create(:group).id] }
    let(:locale) { 'nl-NL' }
    let(:invite_text) { 'Welcome, my friend!' }
    let(:project) { create(:project) }
    let!(:_admin) { create(:admin) }
    let!(:project_moderator) { create(:project_moderator, email: emails[0], projects: [project], locale: 'en') }
    let!(:admin2) { create(:admin, email: emails[1], locale: 'fr-FR') }
    let(:existing_invitee_emails) { [project_moderator.email, admin2.email] }
    let(:roles) do
      [
        { 'type' => 'admin' },
        { 'type' => 'project_moderator', 'project_id' => project.id }
      ]
    end
    let!(:user) { create(:admin) }

    shared_examples 'bulk create job' do |params_key:, duplicate_rows:, invalid_rows:, extra_args: {}|
      let(:invites_import) { create(:invites_import, job_type: extra_args[:job_type], importer: user) }
      let(:create_params) do
        params = {
          roles: [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => project.id }
          ],
          locale: locale,
          group_ids: group_ids,
          invite_text: invite_text
        }
        if params_key == :emails
          params[:emails] = emails
        else
          hash_array = emails.map { |email| { email: email, admin: true } }
          xlsx_stringio = XlsxService.new.hash_array_to_xlsx(hash_array)
          params[:xlsx] = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{Base64.encode64(xlsx_stringio.read)}"
        end
        params
      end

      it 'updates the invites_import with correct value for result attribute' do
        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))
        invites_import.reload

        expect(invites_import.result.count).to eq(6)
        expect(invites_import.result.map { |h| h['email'] }).to match_array(emails)
        expect(invites_import.result.map { |h| h['locale'] }.uniq).to contain_exactly(locale, 'en', 'fr-FR')
        invites_import.result.each do |invite|
          expect(invite['roles']).to include(
            { 'type' => 'admin' },
            { 'project_id' => project.id, 'type' => 'project_moderator' }
          )
        end
      end

      it 'creates expected invite records' do
        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))

        expect(Invite.count).to eq(4) # 6 invited - 2 with emails of existing users

        expected_emails = emails - existing_invitee_emails
        expect(Invite.all.map { |i| i.invitee.email }).to match_array(expected_emails)
        expect(Invite.all.map { |i| i.invitee.groups.map(&:id) }.uniq).to contain_exactly(group_ids)
        expect(Invite.all.map(&:invite_text).uniq).to contain_exactly(invite_text)
        expect(Invite.all.map { |i| i.invitee.locale }.uniq).to eq [locale]
        expect(Invite.all.map { |i| i.invitee.admin? }.uniq).to eq [true]
        expect(Invite.all.map { |i| i.invitee.project_moderator?(project.id) }.all?).to be true
      end

      it 'creates new users as expected' do
        original_users = User.all.to_a
        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))
        new_users = User.all - original_users

        expect(new_users.count).to eq(4) # 6 invited - 2 with emails of existing users
        expect(new_users.map(&:email)).to match_array(emails - existing_invitee_emails)
        new_users.each do |new_user|
          expect(new_user.groups.pluck(:id)).to match_array(group_ids)
          expect(new_user.locale).to eq(locale)
          expect(new_user.roles).to include({ 'type' => 'admin' })
          expect(new_user.roles).to include({ 'type' => 'project_moderator', 'project_id' => project.id })
        end
      end

      it 'updates existing users as expected' do
        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))

        existing_project_moderator = User.find_by(email: project_moderator.email)
        expect(existing_project_moderator.roles).to include({ 'type' => 'admin' })
        expect(existing_project_moderator.roles).to include({ 'type' => 'project_moderator', 'project_id' => project.id })
        expect(existing_project_moderator.groups).to include(*Group.where(id: group_ids))
        expect(existing_project_moderator.locale).to eq('en')

        existing_admin = User.find_by(email: admin2.email)
        expect(existing_admin.roles).to include({ 'type' => 'admin' })
        expect(existing_admin.roles).to include({ 'type' => 'project_moderator', 'project_id' => project.id })
        expect(existing_admin.groups).to include(*Group.where(id: group_ids))
        expect(existing_admin.locale).to eq('fr-FR')
      end

      it 'results in the expected changes to seats in app_configuration' do
        config = AppConfiguration.instance
        config.settings['core']['maximum_admins_number'] = 2
        config.settings['core']['additional_admins_number'] = 1
        config.settings['core']['maximum_moderators_number'] = 2
        config.settings['core']['additional_moderators_number'] = 0
        config.save!

        expect(User.billed_admins.count).to eq(3) # 2 + 1 additional seats

        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))

        config.reload
        maximum_admins = config.settings['core']['maximum_admins_number']
        additional_admins = config.settings['core']['additional_admins_number']
        maximum_moderators = config.settings['core']['maximum_moderators_number']
        additional_moderators = config.settings['core']['additional_moderators_number']

        expect(maximum_admins).to eq(2)
        expect(additional_admins).to eq(6)
        expect(maximum_moderators).to eq(2)
        expect(additional_moderators).to eq(0)
        # We added 5 admins through the invites, (6 invites, but one was for an existing admin user),
        # and we had 1 additional admin seat before the invites were processed.
        # 5 + 1 = 6 additional admin seats now.
        # We had 2 maximum admin seats, so now the total is 8 billed admins.
        expect(User.billed_admins.count).to eq(8) # 2 + 6 additional seats
      end

      it 'updates the invites_import with the expected errors in the result attribute value' do
        emails[0] = 'invalid_email_a'
        emails[3] = 'invalid_email_b'
        emails[4] = emails[1]

        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))
        invites_import.reload

        expect(invites_import.result).to eq(
          'errors' => [
            { 'error' => 'emails_duplicate', 'ignore' => false, 'rows' => duplicate_rows, 'value' => emails[1] },
            { 'error' => 'invalid_email', 'ignore' => false, 'raw_error' => 'Validation failed: Email is invalid', 'row' => invalid_rows[0], 'value' => 'invalid_email_a' },
            { 'error' => 'invalid_email', 'ignore' => false, 'raw_error' => 'Validation failed: Email is invalid', 'row' => invalid_rows[1], 'value' => 'invalid_email_b' }
          ]
        )
      end

      it 'does not create any invites if error(s) encountered' do
        emails[3] = 'invalid_email'

        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))

        expect(Invite.count).to eq(0)
      end

      it 'does not change existing users if error(s) encountered' do
        emails[3] = 'invalid_email'
        original_users = User.all.to_a

        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))

        expect(User.all.to_a).to eq(original_users)
      end
    end

    describe 'with manually specified emails' do
      it_behaves_like 'bulk create job',
        params_key: :emails,
        duplicate_rows: [1, 4],
        invalid_rows: [0, 3],
        extra_args: { job_type: 'bulk_create' }
    end

    describe 'with xlsx file import' do
      it_behaves_like 'bulk create job',
        params_key: :xlsx,
        duplicate_rows: [3, 6],
        invalid_rows: [2, 5],
        extra_args: { job_type: 'bulk_create_xlsx', xlsx_import: true }
    end
  end
end
