require 'rails_helper'

describe WebApi::V1::SpaceSerializer do
  let(:result) { described_class.new(space, params: { current_user: user }).serializable_hash }

  let_it_be(:user, reload: true) { create(:admin) }
  let_it_be(:space, reload: true) do
    create(
      :space,
      title_multiloc: { 'en' => 'Space Title' },
      description_multiloc: { 'en' => 'Space Description' }
    )
  end

  it 'serializes title_multiloc' do
    expect(result.dig(:data, :attributes, :title_multiloc)).to eq({ 'en' => 'Space Title' })
  end

  it 'serializes description_multiloc' do
    expect(result.dig(:data, :attributes, :description_multiloc)).to eq({ 'en' => 'Space Description' })
  end

  it 'includes folders and projects in the space' do
    folder_in_space = create(:project_folder, space: space)
    project_in_space = create(:project, space: space)

    folder_not_in_space = create(:project_folder)
    project_not_in_space = create(:project)

    folder_ids = result.dig(:data, :relationships, :folders, :data).map { |folder| folder[:id] }
    expect(folder_ids).to include(folder_in_space.id.to_s)
    expect(folder_ids).not_to include(folder_not_in_space.id.to_s)

    project_ids = result.dig(:data, :relationships, :projects, :data).map { |project| project[:id] }
    expect(project_ids).to include(project_in_space.id.to_s)
    expect(project_ids).not_to include(project_not_in_space.id.to_s)
  end
end
