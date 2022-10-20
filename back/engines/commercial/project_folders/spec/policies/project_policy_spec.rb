# frozen_string_literal: true

require 'rails_helper'

describe ProjectPolicy do
  subject { described_class.new(user, project) }

  context 'for a continuous project contained within a folder the user moderates' do
    let!(:project) { create(:continuous_project, admin_publication_attributes: { parent_id: project_folder.admin_publication.id }) }
    let!(:project_folder) { create(:project_folder) }
    let(:user) { build(:project_folder_moderator, project_folders: [project_folder]) }

    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:delete_inputs) }
  end

  context 'for a continuous project not contained within a folder the user moderates' do
    let!(:project) { create(:continuous_project) }
    let!(:project_folder) { create(:project_folder) }
    let(:user) { build(:project_folder_moderator, project_folders: [project_folder]) }

    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:delete_inputs) }
  end
end
