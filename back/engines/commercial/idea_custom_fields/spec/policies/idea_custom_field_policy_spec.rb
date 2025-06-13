# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFields::IdeaCustomFieldPolicy do
  subject(:policy) { described_class.new(user, idea_custom_field) }

  let(:custom_form) { create(:custom_form) }
  let!(:phase) { create(:phase, start_at: 1.month.ago, end_at: 1.month.from_now) }
  let!(:_permission) { create(:permission, action: 'posting_idea', permission_scope: phase) }
  let!(:project) { create(:project, custom_form: custom_form, phases: [phase]) }
  let!(:idea_custom_field) { create(:custom_field, resource: custom_form) }

  context 'for a normal user who can access the project' do
    let(:user) { create(:user) }

    it { is_expected.to permit(:index) }
    it do
      pp project.phases
      is_expected.to permit(:show)
    end
    it { is_expected.not_to permit(:update_all) }
  end

  context 'for a normal user who cannot access the project' do
    let(:user) { create(:user) }
    let!(:project) { create(:private_admins_project, custom_form: custom_form) }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:update_all) }
  end

  context "for a moderator of the field's project" do
    let(:user) { create(:project_moderator, projects: [project]) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:update_all) }
  end

  context "for a folder moderator of the field's project" do
    let(:folder) { create(:project_folder, projects: [project]) }
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    before do
      # The after create hook for project_folder changes records, so reload.
      folder.reload
      project.reload
      user.reload
    end

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:update_all) }
  end

  context 'for a moderator of another project' do
    let(:user) { create(:project_moderator) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:update_all) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:update_all) }
  end
end
