# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkImportIdeas::IdeaImport do
  subject { build(:idea_import) }

  describe 'validations' do
    it { is_expected.to be_valid }
  end

  describe 'relations' do
    it 'can delete an idea that has been imported' do
      user = create(:admin)
      idea = create(:idea)
      create(:idea_import, idea: idea, import_user: user)
      idea.destroy!

      expect(Idea.all.count).to eq 0
      expect(described_class.all.count).to eq 0
    end
  end
end
