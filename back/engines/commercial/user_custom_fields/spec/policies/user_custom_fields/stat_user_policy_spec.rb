# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::StatUserPolicy do
  subject(:policy) { described_class.new(user, nil) }

  let(:project) { create(:project) }
  let(:folder) { create(:project_folder, projects: [project]) }
  let(:space) { create(:space) }

  shared_examples 'is granted stats access' do
    it { is_expected.to permit(:users_by_age) }
    it { is_expected.to permit(:users_by_custom_field) }
    it { is_expected.to permit(:users_by_age_as_xlsx) }
    it { is_expected.to permit(:users_by_custom_field_as_xlsx) }
  end

  shared_examples 'is denied stats access' do
    it { is_expected.not_to permit(:users_by_age) }
    it { is_expected.not_to permit(:users_by_custom_field) }
    it { is_expected.not_to permit(:users_by_age_as_xlsx) }
    it { is_expected.not_to permit(:users_by_custom_field_as_xlsx) }
  end

  context 'when the user has admin rights' do
    let_it_be(:user) { build(:admin) }

    it_behaves_like 'is granted stats access'
  end

  context 'when user is a project moderator' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it_behaves_like 'is granted stats access'
  end

  context 'when user is a folder moderator' do
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    it_behaves_like 'is granted stats access'
  end

  context 'when user is a space moderator' do
    let(:user) { create(:space_moderator, spaces: [space]) }

    it_behaves_like 'is granted stats access'
  end

  context 'when user is a normal user' do
    let_it_be(:user) { build(:user) }

    it_behaves_like 'is denied stats access'
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it_behaves_like 'is denied stats access'
  end
end
