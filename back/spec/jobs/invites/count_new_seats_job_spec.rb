require 'rails_helper'

RSpec.describe Invites::CountNewSeatsJob do
  describe '#perform' do
    let(:emails) { Array.new(5) { Faker::Internet.email }.push(nil) }
    let(:project) { create(:project) }
    let!(:_project_moderator1) { create(:project_moderator, projects: [project]) }
    let!(:_admin) { create(:admin) }
    let!(:_project_moderator2) { create(:project_moderator, email: emails[0], projects: [project]) }
    let!(:_admin2) { create(:admin, email: emails[1]) }
    let!(:user) { create(:admin) }

    shared_examples 'count new seats job' do |params_key:, duplicate_rows:, invalid_rows:, extra_args: {}|
      let(:invites_import) { create(:invites_import, job_type: extra_args[:job_type], importer: user) }
      let(:create_params) do
        params = {
          roles: [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => project.id }
          ]
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

        expect(invites_import.result).to include(
          'newly_added_admins_number' => 5,
          'newly_added_moderators_number' => -1
        )
      end

      it 'does not create any users or invites' do
        original_users = User.all.to_a

        described_class.perform_now(user, create_params, invites_import.id, **extra_args.except(:job_type))

        expect(User.all.to_a).to eq(original_users)
        expect(Invite.count).to eq(0)
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
    end

    describe 'with manually specified emails' do
      it_behaves_like 'count new seats job',
        params_key: :emails,
        duplicate_rows: [1, 4],
        invalid_rows: [0, 3],
        extra_args: { job_type: 'count_new_seats' }
    end

    describe 'with xlsx import' do
      it_behaves_like 'count new seats job',
        params_key: :xlsx,
        duplicate_rows: [3, 6],
        invalid_rows: [2, 5],
        extra_args: { job_type: 'count_new_seats_xlsx', xlsx_import: true }
    end
  end
end
