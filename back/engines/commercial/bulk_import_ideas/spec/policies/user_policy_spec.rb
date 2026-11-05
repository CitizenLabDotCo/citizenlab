# frozen_string_literal: true

require 'rails_helper'

describe UserPolicy do
  subject { described_class.new current_user, subject_user }

  let(:scope) { UserPolicy::Scope.new current_user, User }

  let!(:space) { create(:space) }
  let!(:project1) { create(:project, space: space) }
  let!(:project2) { create(:project, space: space) }
  let!(:folder) { create(:project_folder, projects: [project1, project2], space: space) }

  shared_examples 'allows editing only an imported draft user in a moderated project' do
    context 'on a user created through import' do
      let(:subject_user) { create(:user) }

      context 'if the user has imported draft ideas and no published ideas' do
        before do
          idea = create(:idea, project: project1, author: subject_user, publication_status: 'draft')
          create(:idea_import, idea: idea, user_created: true)
        end

        it { is_expected.to permit(:update) }
      end

      context 'if the user has published ideas' do
        before do
          idea = create(:idea, project: project1, author: subject_user, publication_status: 'published')
          create(:idea_import, idea: idea, user_created: true)
        end

        it { is_expected.not_to permit(:update) }
      end

      context 'if the user has imported draft ideas on other projects' do
        before do
          no_moderation_project = create(:project)
          idea = create(:idea, project: no_moderation_project, author: subject_user, publication_status: 'draft')
          create(:idea_import, idea: idea, user_created: true)
        end

        it { is_expected.not_to permit(:update) }
      end

      context 'if the user was not created by import' do
        before do
          idea = create(:idea, project: project1, author: subject_user, publication_status: 'draft')
          create(:idea_import, idea: idea, user_created: false)
        end

        it { is_expected.not_to permit(:update) }
      end

      context 'if the draft idea was not imported' do
        before do
          create(:idea, project: project1, author: subject_user, publication_status: 'draft')
        end

        it { is_expected.not_to permit(:update) }
      end
    end
  end

  context 'for a project moderator' do
    let(:current_user) { create(:project_moderator, projects: [project1, project2]) }

    it_behaves_like 'allows editing only an imported draft user in a moderated project'
  end

  context 'for a folder moderator' do
    let(:current_user) { create(:project_folder_moderator, project_folders: [folder]) }

    it_behaves_like 'allows editing only an imported draft user in a moderated project'
  end

  context 'for a space moderator' do
    let(:current_user) { create(:space_moderator, spaces: [space]) }

    it_behaves_like 'allows editing only an imported draft user in a moderated project'
  end
end
