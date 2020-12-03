require 'rails_helper'

describe ProjectPolicy do
  subject { ProjectPolicy.new(user, project) }
  let(:scope) { ProjectPolicy::Scope.new(user, Project) }
  let(:inverse_scope) { ProjectPolicy::InverseScope.new(project, User) }

  let!(:project) { create(:project) }

  context 'for an project folder moderator' do
    let(:user) { build(:project_folder_moderator) }

    it { should     permit(:show)    }
    it { should     permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:reorder) }
    it { should_not permit(:destroy) }

    it 'should index the project'  do
      expect(scope.resolve.size).to eq 1
      expect(scope.moderatable.size).to eq 1
    end

    it 'should include the user in the users that have access' do
      expect(inverse_scope.resolve).to include(user)
    end
  end
end
