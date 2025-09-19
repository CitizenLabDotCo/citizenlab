require 'rails_helper'

RSpec.describe Invites::CountNewSeatsJob do
  describe '#perform' do
    let(:emails) { Array.new(5) { Faker::Internet.email }.push(nil) }
    let(:project) { create(:project) }
    let!(:_project_moderator1) { create(:project_moderator, projects: [project]) }
    let!(:_admin) { create(:admin) }
    let!(:_project_moderator2) { create(:project_moderator, email: emails[0], projects: [project]) }
    let!(:_admin2) { create(:admin, email: emails[1]) }

    let(:roles) do
      # only the highest role is actually used
      [
        { 'type' => 'admin' },
        { 'type' => 'project_moderator', 'project_id' => @project.id }
      ]
    end
    let(:user) { create(:admin) }

    describe 'with manually specified emails' do
      let(:invites_import) { create(:invites_import, job_type: 'count_new_seats', importer: user) }
      let(:create_params) do
        {
          roles: [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => project.id }
          ],
          emails: emails
        }
      end

      it 'sets the correct result in the invites_import result attribute' do
        described_class.perform_now(user, create_params, invites_import.id)
        invites_import.reload

        expect(invites_import.result).to include(
          'newly_added_admins_number' => 4,
          'newly_added_moderators_number' => -1
        )
      end

      it 'sets the expected errors in the invites_import result attribute' do
        emails[0] = 'invalid_email_1'
        emails[3] = 'invalid_email_2'
        emails[4] = emails[1]

        described_class.perform_now(user, create_params, invites_import.id)
        invites_import.reload

        expect(invites_import.result).to eq(
          'errors' => [
            { 'error' => 'emails_duplicate', 'ignore' => false, 'rows' => [1, 4], 'value' => emails[1] },
            { 'error' => 'invalid_email', 'ignore' => false, 'raw_error' => 'Validation failed: Email is invalid', 'row' => 0, 'value' => 'invalid_email_1' },
            { 'error' => 'invalid_email', 'ignore' => false, 'raw_error' => 'Validation failed: Email is invalid', 'row' => 3, 'value' => 'invalid_email_2' }
          ]
        )
      end
    end

    describe 'with xlsx import' do
      let(:invites_import) { create(:invites_import, job_type: 'count_new_seats_xlsx', importer: user) }
      let(:xlsx) do
        hash_array = emails.map { |email| { email: email, admin: true } }
        xlsx_stringio = XlsxService.new.hash_array_to_xlsx(hash_array)

        "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,#{Base64.encode64(xlsx_stringio.read)}"
      end

      let(:create_params) do
        {
          roles: [
            { 'type' => 'admin' },
            { 'type' => 'project_moderator', 'project_id' => project.id }
          ],
          xlsx: xlsx
        }
      end

      it 'sets the correct result in the invites_import result attribute' do
        described_class.perform_now(user, create_params, invites_import.id, xlsx_import: true)
        invites_import.reload

        expect(invites_import.result).to include(
          'newly_added_admins_number' => 4,
          'newly_added_moderators_number' => -1
        )
      end

      it 'sets the expected errors in the invites_import result attribute' do
        emails[0] = 'invalid_email_a'
        emails[3] = 'invalid_email_b'
        emails[4] = emails[1]

        described_class.perform_now(user, create_params, invites_import.id, xlsx_import: true)
        invites_import.reload

        expect(invites_import.result).to eq(
          'errors' => [
            { 'error' => 'emails_duplicate', 'ignore' => false, 'rows' => [3, 6], 'value' => emails[1] },
            { 'error' => 'invalid_email', 'ignore' => false, 'raw_error' => 'Validation failed: Email is invalid', 'row' => 2, 'value' => 'invalid_email_a' },
            { 'error' => 'invalid_email', 'ignore' => false, 'raw_error' => 'Validation failed: Email is invalid', 'row' => 5, 'value' => 'invalid_email_b' }
          ]
        )
      end
    end
  end
end
