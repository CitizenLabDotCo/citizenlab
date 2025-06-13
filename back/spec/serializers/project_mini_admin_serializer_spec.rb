require 'rails_helper'

describe WebApi::V1::ProjectMiniAdminSerializer do
  let!(:project) { create(:project_with_phases) }
  let!(:user) { create(:user) }
  let!(:folder) { create(:project_folder, projects: [project]) }

  let!(:serialized_project) do
    described_class
      .new(project, params: { current_user: user })
      .serializable_hash
  end

  it 'serializes publication_status' do
    expect(serialized_project.dig(:data, :attributes, :publication_status)).to eq(project.admin_publication.publication_status)
  end

  it 'serializes first_phase_start_date' do
    first_phase = project.phases.order(:start_at).first
    expect(serialized_project.dig(:data, :attributes, :first_phase_start_date)).to eq(first_phase.start_at)
  end

  it 'serializes last_phase_end_date' do
    last_phase = project.phases.order(:start_at).last
    expect(serialized_project.dig(:data, :attributes, :last_phase_end_date)).to eq(last_phase.end_at)
  end

  it 'serializes folder_title_multiloc' do
    expect(serialized_project.dig(:data, :attributes, :folder_title_multiloc)).to eq(folder.title_multiloc)
  end

  it 'includes current_phase' do
    project2 = create(:project_with_active_ideation_phase)
    serialized_project2 = described_class
      .new(project2, params: { current_user: user })
      .serializable_hash

    current_phase_id = serialized_project2.dig(:data, :relationships, :current_phase, :data, :id)
    expect(current_phase_id).to eq(project2.phases.first.id)
  end
end
