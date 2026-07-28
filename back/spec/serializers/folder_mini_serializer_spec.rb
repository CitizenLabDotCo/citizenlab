require 'rails_helper'

describe WebApi::V1::FolderMiniSerializer do
  let!(:folder) { create(:project_folder) }
  let!(:user) { create(:user) }

  let(:serialized_folder) do
    described_class
      .new(folder, params: { current_user: user })
      .serializable_hash
  end

  it 'serializes title_multiloc' do
    expect(serialized_folder.dig(:data, :attributes, :title_multiloc)).to eq(folder.title_multiloc)
  end

  it 'serializes space_id and space_title_multiloc when the folder belongs to a space' do
    space = create(:space)
    folder.update!(space: space)

    expect(serialized_folder.dig(:data, :attributes, :space_id)).to eq(space.id)
    expect(serialized_folder.dig(:data, :attributes, :space_title_multiloc)).to eq(space.title_multiloc)
  end

  it 'serializes a nil space_title_multiloc when the folder has no space' do
    expect(serialized_folder.dig(:data, :attributes, :space_id)).to be_nil
    expect(serialized_folder.dig(:data, :attributes, :space_title_multiloc)).to be_nil
  end
end
