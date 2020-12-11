require 'rails_helper'

RSpec.describe User, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:user)).to be_valid
    end
  end

  describe 'managing project folder moderator roles' do
    let(:roleable) { create(:project_folder) }
    let(:other_roleable) { create(:project_folder) }

    include_examples 'has_many_associated_roles', 'project_folder_moderator'
  end
end
