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
      expect(idea_import.content_changes).to eq({})
    end

    it 'logs any changes made to the idea when an idea is published' do
      idea = create(:idea, publication_status: 'draft', title_multiloc: { en: 'A title' })
      idea_import = create(:idea_import, idea: idea)
      idea.update!(publication_status: 'published', title_multiloc: { en: 'A new title' })

      expect(idea_import.content_changes.keys).to eq ['title_multiloc']
    end

    context 'users created by the idea import' do
      context 'deleting ideas' do
        it 'deletes a user when deleting a draft idea' do
          user = create(:user)
          idea = create(:idea, publication_status: 'draft', author: user)
          create(:idea_import, idea: idea, user_created: true)
          idea.destroy!

          expect(Idea.all.count).to eq 0
          expect(described_class.all.count).to eq 0
          expect { user.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end

        it 'does not delete a user when deleting a published idea' do
          user = create(:user)
          idea = create(:idea, publication_status: 'published', author: user)
          create(:idea_import, idea: idea, user_created: true)
          idea.destroy!

          expect(Idea.all.count).to eq 0
          expect(described_class.all.count).to eq 0
          expect(user.reload).to eq user
        end

        it 'does not delete a pre-existing user when deleting a draft idea' do
          user = create(:user)
          idea = create(:idea, publication_status: 'draft', author: user)
          create(:idea_import, idea: idea, user_created: false)
          idea.destroy!

          expect(Idea.all.count).to eq 0
          expect(described_class.all.count).to eq 0
          expect(user.reload).to eq user
        end
      end

      context 'when publishing an idea' do
        it 'creates an anonymous user when the author is nil' do
          idea = create(:idea, publication_status: 'draft', author: nil)
          create(:idea_import, idea: idea, user_created: false, user_consent: false)
          idea.update!(publication_status: 'published')
          expect(idea.reload.author).not_to be_nil
        end

        it 'deletes an imported user that has been created but removed in the edit' do
          user = create(:user)
          idea = create(:idea, publication_status: 'draft', author: user)
          idea_import = create(:idea_import, idea: idea, user_created: true, user_consent: true)
          idea.update!(publication_status: 'published', author: nil)

          expect(idea.reload.author.id).not_to eq user.id
          expect { user.reload }.to raise_error(ActiveRecord::RecordNotFound)
          expect(idea_import.reload.user_created).to be true
          expect(idea_import.reload.user_consent).to be false
        end

        it 'adds an existing user to an imported idea' do
          idea = create(:idea, publication_status: 'draft', author: nil)
          idea_import = create(:idea_import, idea: idea, user_created: false, user_consent: false)
          user = create(:user)
          idea.update!(publication_status: 'published', author: user)

          expect(idea.reload.author.id).to eq user.id
          expect(idea_import.reload.user_created).to be false
          expect(idea_import.reload.user_consent).to be true
        end
      end
    end
  end
end
