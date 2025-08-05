# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idea do
  it 'can delete an idea that has been imported' do
    user = create(:admin)
    idea = create(:idea)
    create(:idea_import, idea: idea, import_user: user)
    idea.destroy!

    expect(described_class.all.count).to eq 0
    expect(described_class.all.count).to eq 0
  end

  it 'sets the approved date when an imported idea is published' do
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
        user = create(:user, password: nil) # Password is nil because the user is created by the idea import
        idea = create(:idea, publication_status: 'draft', author: user)
        create(:idea_import, idea: idea, user_created: true)
        idea.destroy!

        expect(described_class.all.count).to eq 0
        expect(described_class.all.count).to eq 0
        expect { user.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'does not delete a user when the user has a password' do
        user = create(:user, password: 'abcd1234')
        idea = create(:idea, publication_status: 'draft', author: user)
        create(:idea_import, idea: idea, user_created: true)
        idea.destroy!

        expect(described_class.all.count).to eq 0
        expect(described_class.all.count).to eq 0
        expect(user.reload).to eq user
      end

      it 'does not delete a user when deleting a published idea' do
        user = create(:user, password: nil)
        idea = create(:idea, publication_status: 'published', author: user)
        create(:idea_import, idea: idea, user_created: true)
        idea.destroy!

        expect(described_class.all.count).to eq 0
        expect(described_class.all.count).to eq 0
        expect(user.reload).to eq user
      end

      it 'does not delete a pre-existing user when deleting a draft idea' do
        user = create(:user)
        idea = create(:idea, publication_status: 'draft', author: user)
        create(:idea_import, idea: idea, user_created: false)
        idea.destroy!

        expect(described_class.all.count).to eq 0
        expect(described_class.all.count).to eq 0
        expect(user.reload).to eq user
      end
    end

    context 'when publishing an idea' do
      it 'deletes an imported user that has been created but removed in the edit' do
        user = create(:user)
        idea = create(:idea, publication_status: 'draft', author: user)
        idea_import = create(:idea_import, idea: idea, user_created: true, user_consent: true)
        idea.update!(publication_status: 'published', author: nil)

        expect(idea.reload.author).to be_nil
        expect { user.reload }.to raise_error(ActiveRecord::RecordNotFound)
        expect(idea_import.reload.user_created).to be false
        expect(idea_import.reload.user_consent).to be false
      end

      it 'adds an existing user to an imported idea' do
        idea = create(:idea, publication_status: 'draft', author: nil)
        idea_import = create(:idea_import, idea: idea, user_created: false, user_consent: false)
        user = create(:user, created_at: 10.days.ago)
        idea.update!(publication_status: 'published', author: user)

        expect(idea.reload.author.id).to eq user.id
        expect(idea_import.reload.user_created).to be false
        expect(idea_import.reload.user_consent).to be true
      end

      it 'adds an new user to an imported idea' do
        idea = create(:idea, publication_status: 'draft', author: nil)
        idea_import = create(:idea_import, idea: idea, user_created: false, user_consent: false)
        user = create(:user, created_at: 15.minutes.ago)
        idea.update!(publication_status: 'published', author: user)

        expect(idea.reload.author.id).to eq user.id
        expect(idea_import.reload.user_created).to be true
        expect(idea_import.reload.user_consent).to be true
      end
    end
  end
end
