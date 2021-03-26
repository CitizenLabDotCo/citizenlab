require 'rails_helper'

RSpec.describe UpdateMemberCountJob, type: :job do
  
  subject(:job) { UpdateMemberCountJob.new }

  describe '#perform' do

    it "updates all groups without arguments" do
      rules_groups = create_list(:smart_group, 2)
      manual_group = create(:group)

      expect(manual_group).not_to receive(:update_memberships_count!)

      job.perform
    end

    it "updates the given group with argument" do
      group = create(:smart_group)

      expect(group).to receive(:update_memberships_count!)

      job.perform(group)
    end
  end
end
