require 'rails_helper'

RSpec.describe Project, type: :model do
  subject(:project) { create(:project) }

  let(:user) { create(:user) }

  describe 'before_destroy' do
    it 'destroys any smart group that refers to this project' do
      group1 = create(:smart_group, rules: [{
                        ruleType: 'participated_in_project',
                        predicate: 'in',
                        value: [project.id]
                      }])
      create(:smart_group)
      create(:group)
      expect(Group.count).to eq 3
      project.destroy
      expect { group1.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect(Group.count).to eq 2
    end
  end
end
