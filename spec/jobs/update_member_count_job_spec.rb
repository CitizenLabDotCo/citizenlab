require 'rails_helper'

RSpec.describe UpdateMemberCountJob, type: :job do
  
  subject(:job) { UpdateMemberCountJob.new }

  describe '#perform' do

    # Support ends_on predicate
    pending "doesn't throw an exception" do
      rules_groups = create_list(:smart_group, 2)
      manual_group = create(:group)

      expect(rules_groups[0]).to receive(:update_memberships_count!)
      expect(rules_groups[1]).to receive(:update_memberships_count!)
      expect(manual_group).not_to receive(:update_memberships_count!)

      job.perform
    end
  end
end
