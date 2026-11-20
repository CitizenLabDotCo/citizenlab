# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::ProjectAdminSearchSerializer do
  let(:result) { described_class.new(project).serializable_hash }
  let(:folder) { create(:project_folder, title_multiloc: { 'en' => 'Folder title' }) }
  let(:project) do
    create(:project_with_phases, phases_count: 2, folder: folder, title_multiloc: { 'en' => 'Project title' })
  end

  it 'serializes only the titles search needs' do
    expect(result.dig(:data, :attributes).keys).to match_array(%i[title_multiloc folder_id folder_title_multiloc phases])
    expect(result.dig(:data, :attributes, :title_multiloc)).to eq({ 'en' => 'Project title' })
    expect(result.dig(:data, :attributes, :folder_id)).to eq(folder.id)
    expect(result.dig(:data, :attributes, :folder_title_multiloc)).to eq({ 'en' => 'Folder title' })
  end

  it 'serializes the phases in order, with only their id and title' do
    phases = result.dig(:data, :attributes, :phases)

    expect(phases).to eq(
      project.phases.map { |phase| { id: phase.id, title_multiloc: phase.title_multiloc } }
    )
  end

  it 'has no folder for a project outside a folder' do
    project = create(:project)
    result = described_class.new(project).serializable_hash

    expect(result.dig(:data, :attributes, :folder_id)).to be_nil
    expect(result.dig(:data, :attributes, :folder_title_multiloc)).to be_nil
  end
end
