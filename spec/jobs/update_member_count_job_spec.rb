require 'rails_helper'

RSpec.describe UpdateMemberCountJob, type: :job do
  subject(:job) { described_class.new }

  describe '#perform' do
    it 'updates the given group with argument' do
      group = create(:group)

      expect(group).to have_received(:update_memberships_count!)

      job.perform(group)
    end

    it 'updates all groups without argument' do
      create_list(:group, 5)

      expect(Group).to have_received(:find_each).with(&:update_memberships_count!)

      job.perform
    end
  end
end
