require 'rails_helper'

RSpec.describe InvitesImport do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:invites_import)).to be_valid
    end
  end

  it { is_expected.to validate_inclusion_of(:job_type).in_array(described_class::JOB_TYPES) }
  it { is_expected.to belong_to(:importer).class_name('User').optional }

  describe 'User deletion' do
    it 'cleans up InviteImport references' do
      user = create(:user)
      create(:invites_import, importer: user)

      expect { user.destroy }.to change { described_class.where(importer_id: user.id).count }.from(1).to(0)
    end
  end
end
