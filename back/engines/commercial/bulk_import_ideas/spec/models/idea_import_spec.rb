# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkImportIdeas::IdeaImport do
  subject { build(:idea_import) }

  describe 'validations' do
    it { is_expected.to be_valid }
  end

  describe 'other stuff' do
    it 'does stuff' do
      user = create(:admin)
      import = create(:idea_import, import_user: user)
      expect(import.import_user).to eq user
      # binding.pry
    end
  end
end
