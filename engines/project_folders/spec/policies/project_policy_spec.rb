require 'rails_helper'

ProjectPolicy.prepend ProjectFolders::MonkeyPatches::ProjectPolicy

describe ProjectPolicy do
  subject { ProjectPolicy.new(user, project) }
  let!(:project) { create(:project) }

  context 'for an project folder moderator' do
    let(:user) { build(:project_folder_moderator) }

    it { should permit(:create) }
  end
end
