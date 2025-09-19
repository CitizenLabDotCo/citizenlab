require 'rails_helper'

RSpec.describe Invites::BulkCreateJob do
  describe '#perform' do
    let!(:emails) { Array.new(5) { Faker::Internet.email }.push(nil) }
    let(:group_ids) { [create(:group).id] }
    let(:locale) { 'nl-NL' }
    let(:invite_text) { 'Welcome, my friend!' }
    let(:project) { create(:project) }
    let!(:_project_moderator1) { create(:project_moderator, projects: [project]) }
    let!(:_admin) { create(:admin) }
    let!(:project_moderator2) { create(:project_moderator, email: emails[0], projects: [project], locale: 'en') }
    let!(:admin2) { create(:admin, email: emails[1], locale: 'fr-FR') }
    # existing_invitee_emails = [project_moderator2.email, admin2.email]
    let(:existing_invitee_emails) { [project_moderator2.email, admin2.email] }

    let(:roles) do
      # only the highest role is actually used
      [
        { 'type' => 'admin' },
        { 'type' => 'project_moderator', 'project_id' => project.id }
      ]
    end
    let!(:user) { create(:admin) }

    before do
      project_moderator2
      admin2
    end

    describe 'with manually specified emails' do
      let(:invites_import) { create(:invites_import, job_type: 'bulk_create', importer: user) }
      let(:create_params) do
        {
          roles: [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => project.id }
          ],
          emails: emails,
          locale: locale,
          group_ids: group_ids,
          invite_text: invite_text
        }
      end

      it 'sets the correct result in the invites_import result attribute' do
        described_class.perform_now(user, create_params, invites_import.id)
        invites_import.reload

        expect(invites_import.result.count).to eq(6)
        expect(invites_import.result.map { |h| h['email'] }).to match_array(emails)
        expect(invites_import.result.map { |h| h['locale'] }.uniq).to match_array([locale, 'en', 'fr-FR']) # respects existing user locales
        invites_import.result.each do |invite|
          expect(invite['roles']).to include(
            { 'type' => 'admin' },
            { 'project_id' => project.id, 'type' => 'project_moderator' }
          )
        end
      end

      it 'creates expected invite records' do
        described_class.perform_now(user, create_params, invites_import.id)

        expect(Invite.count).to eq(4) # 6 invited - 2 with emails of existing users

        expected_emails = emails - existing_invitee_emails
        expect(Invite.all.map { |i| i.invitee.email }).to match_array(expected_emails)
        expect(Invite.all.map { |i| i.invitee.groups.map(&:id) }.uniq).to match_array [group_ids]
        expect(Invite.all.map { |i| i.invitee.locale }.uniq).to eq [locale]
        expect(Invite.all.map { |i| i.invitee.admin? }.uniq).to eq [true]
        expect(Invite.all.map { |i| i.invitee.project_moderator?(project.id) }.all?).to be true
      end

      it 'creates new users as expected' do
        original_users = User.all.to_a
        described_class.perform_now(user, create_params, invites_import.id)
        new_users = User.all - original_users

        expect(new_users.count).to eq(4) # 6 invited - 2 with emails of existing users
        expect(new_users.map(&:email)).to match_array(emails - existing_invitee_emails)
        new_users.each do |new_user|
          expect(new_user.groups.pluck(:id)).to match_array(group_ids)
          expect(new_user.roles).to include({ 'type' => 'admin' })
          expect(new_user.roles).to include({ 'type' => 'project_moderator', 'project_id' => project.id })
        end
      end

      it 'updates existing users as expected' do
        described_class.perform_now(user, create_params, invites_import.id)

        existing_project_moderator = User.find_by(email: project_moderator2.email)
        expect(existing_project_moderator.roles).to include({ 'type' => 'admin' })
        expect(existing_project_moderator.roles).to include({ 'type' => 'project_moderator', 'project_id' => project.id })
        expect(existing_project_moderator.groups).to include(*Group.where(id: group_ids))

        existing_admin = User.find_by(email: admin2.email)
        expect(existing_admin.roles).to include({ 'type' => 'admin' })
        expect(existing_admin.roles).to include({ 'type' => 'project_moderator', 'project_id' => project.id })
        expect(existing_admin.groups).to include(*Group.where(id: group_ids))
      end
    end
  end
end
