require 'rails_helper'

RSpec.describe InvitesImport do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:invites_import)).to be_valid
    end
  end

  it { is_expected.to validate_inclusion_of(:job_type).in_array(described_class::JOB_TYPES) }
  it { is_expected.to belong_to(:importer).class_name('User').optional }
end