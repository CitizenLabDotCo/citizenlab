# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectReviewPolicy do
  subject { described_class.new(user, project_review) }

  let_it_be(:project) { create(:project) }
  let_it_be(:folder) { create(:project_folder, projects: [project]).tap { project.reload } }

  context 'when the user is not the requester/reviewer' do
    let(:project_review) { create(:project_review, project: project) }

    context 'and is a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'and is a normal user' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'and is an admin' do
      let(:user) { create(:admin) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.to permit(:destroy) }
    end

    context 'and moderates the folder of the project' do
      let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.to permit(:destroy) }
    end

    context 'and moderates another folder' do
      let(:user) { create(:project_folder_moderator) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'and moderates the project' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'and moderates another project' do
      let(:user) { create(:project_moderator) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end
  end

  context 'when the user is the requester' do
    let(:project_review) { build(:project_review, project: project, requester: user) }

    context 'and is an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.to permit(:destroy) }
    end

    context 'and moderates the folder of the project' do
      let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.to permit(:destroy) }
    end

    context 'and moderates the project' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.to permit(:destroy) }
    end

    # This case happens when moderator rights are removed from the user.
    context 'and is a normal user' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end
  end

  context 'when the user is the reviewer' do
    let(:project_review) { build(:project_review, project: project, reviewer: user) }

    context 'and is an admin' do
      let(:user) { create(:admin) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:destroy) }
    end

    context 'and moderates the folder of the project' do
      let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:destroy) }
    end

    context 'and moderates the project' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end
  end
end
