# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkImportIdeas::IdeaImport do
  subject { build(:idea_import) }

  describe 'validations' do
    it { is_expected.to be_valid }
  end

  describe 'idea relationship' do
    it 'can delete an idea that has been imported' do
      user = create(:admin)
      idea = create(:idea)
      create(:idea_import, idea: idea, import_user: user)
      idea.destroy!

      expect(Idea.all.count).to eq 0
      expect(described_class.all.count).to eq 0
    end

    it 'sets the approved date when an idea is published' do
      idea = create(:idea, publication_status: 'draft')
      idea_import = create(:idea_import, idea: idea)
      idea.update!(publication_status: 'published')

      expect(idea_import.approved_at).not_to be_nil
    end
  end
end
