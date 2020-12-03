require 'rails_helper'

describe ProjectPolicy do
  subject { ProjectPolicy.new(user, project) }
  let(:scope) { ProjectPolicy::Scope.new(user, Project) }
  let(:inverse_scope) { ProjectPolicy::InverseScope.new(project, User) }

  let!(:project) { create(:project) }

  context 'for an project folder moderator' do
    let(:user) { build(:project_folder_moderator) }

    it { should permit(:create) }
  end
end
