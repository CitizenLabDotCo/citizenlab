# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Report do
  subject(:report) { build(:report) }

  it { is_expected.to validate_uniqueness_of(:name) }
  it { is_expected.to belong_to(:owner).class_name('User') }
  it { is_expected.to have_one(:layout).class_name('ContentBuilder::Layout').dependent(:destroy) }

  describe 'user deletion' do
    it 'deletes reports that the user owns' do
      report = create(:report)
      user = report.owner
      expect(user.destroy).to be_truthy
      expect(described_class.find_by(id: report.id)).to be_nil
    end
  end
end
