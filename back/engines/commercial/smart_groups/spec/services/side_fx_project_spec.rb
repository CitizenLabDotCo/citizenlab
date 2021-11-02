require "rails_helper"

describe SideFxProjectService do
  let(:sfx_pc) { instance_double(SideFxParticipationContextService) }
  let(:service) { SideFxProjectService.new(sfx_pc) }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe "before_destroy" do
    it "destroys any smart group that refers to this project" do
      group1 = create(:smart_group, rules: [{
        ruleType: 'participated_in_project',
        predicate: 'in',
        value: [project.id]
      }])
      group2 = create(:smart_group)
      group3 = create(:group)
      service.before_destroy(project, user)
      expect{group1.reload}.to raise_error(ActiveRecord::RecordNotFound)
      expect(Group.count).to eq 2
    end
  end
end
