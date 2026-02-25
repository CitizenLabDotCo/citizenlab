require 'rails_helper'

RSpec.describe Workspace do
  describe 'Default factory' do
    subject(:workspace) { build(:workspace) }

    it { is_expected.to be_valid }

    describe 'validations' do
      it { is_expected.to validate_presence_of(:title_multiloc) }

      it 'is invalid when title_multiloc is empty' do
        workspace = build(:workspace, title_multiloc: {})
        expect(workspace).to be_invalid
        expect(workspace.errors[:title_multiloc]).to be_present
      end

      it 'is valid when description_multiloc is empty' do
        workspace = build(:workspace, description_multiloc: {})
        expect(workspace).to be_valid
      end
    end
  end
end
