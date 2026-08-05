require 'rails_helper'

RSpec.describe Invites::ImportRunner do
  subject(:runner) { described_class.new(invites_import.id) }

  let(:invites_import) { create(:invites_import, job_type: 'count_new_seats', importer: create(:admin)) }

  describe '#run' do
    it 'completes the import with the result of the block' do
      runner.run { { newly_added_admins_number: 2, newly_added_moderators_number: 0 } }

      invites_import.reload
      expect(invites_import.completed_at).to be_present
      expect(invites_import.result).to eq(
        'newly_added_admins_number' => 2, 'newly_added_moderators_number' => 0
      )
    end

    it 'completes the import with the invite errors when the block fails' do
      invite_error = Invites::InviteError.new('invalid_email', row: 3, value: 'not_an_email')

      runner.run { raise Invites::FailedError, errors: [invite_error] }

      invites_import.reload
      expect(invites_import.completed_at).to be_present
      expect(invites_import.result).to eq(
        'errors' => [{ 'error' => 'invalid_email', 'row' => 3, 'value' => 'not_an_email', 'ignore' => false }]
      )
    end

    # Without this the import would stay pending forever — neither invites job
    # retries — and the admin would wait out the front-end timeout instead of
    # being shown the error.
    it 'completes the import with an error and re-raises anything else' do
      expect { runner.run { raise ActiveRecord::StatementInvalid, 'boom' } }
        .to raise_error(ActiveRecord::StatementInvalid)

      invites_import.reload
      expect(invites_import.completed_at).to be_present
      # A count creates and sends nothing, so the admin can just try again.
      expect(invites_import.result).to eq('errors' => [{ 'error' => 'unexpected_seats_count_error' }])
    end

    # A creation may have got part way, so the admin is told to look before retrying.
    it 'reports a failed creation under its own error key' do
      create_import = create(:invites_import, job_type: 'bulk_create', importer: create(:admin))

      expect { described_class.new(create_import.id).run { raise ActiveRecord::StatementInvalid, 'boom' } }
        .to raise_error(ActiveRecord::StatementInvalid)

      expect(create_import.reload.result).to eq('errors' => [{ 'error' => 'unexpected_invite_error' }])
    end

    it 'raises when the import no longer exists' do
      expect { described_class.new(SecureRandom.uuid).run { {} } }
        .to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
