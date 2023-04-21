# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UpdateMemberCountJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    it 'updates the given group with argument' do
      group = create(:group)
      create_list(:user, 3, manual_groups: [group])

      job.perform(group)
      expect(group.memberships_count).to eq 3
    end

    it 'updates all groups without argument' do
      create_list(:group, 5).each do |group|
        create_list(:user, 2, manual_groups: [group])
      end

      job.perform
      expect(Group.distinct.pluck(:memberships_count)).to eq [2]
    end
  end
end
