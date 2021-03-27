require "rails_helper"

describe SideFxAreaService do
  let(:service) { SideFxAreaService.new }
  let(:user) { create(:user) }
  let(:area) { create(:area) }

  describe "before_destroy" do
    it "destroys any smart group that refers to this area" do
      group1 = create(:smart_group, rules: [{
        ruleType: 'lives_in',
        predicate: 'has_value',
        value: area.id
      }])
      group2 = create(:smart_group)
      group3 = create(:group)
      service.before_destroy(area, user)
      expect{group1.reload}.to raise_error(ActiveRecord::RecordNotFound)
      expect(Group.count).to eq 2
    end
  end
end
