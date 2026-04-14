# frozen_string_literal: true

require 'rails_helper'

describe TreeViewService do
  describe '#generate_tree' do
    it 'returns an empty array when there are no publications' do
      result = described_class.new.generate_tree
      expect(result).to eq([])
    end

    it 'returns root-level projects without space' do
      project1 = create(:project, space: nil)
      project2 = create(:project, space: nil)

      result = described_class.new.generate_tree

      expect(result.size).to eq(2)
      expect(result).to include(
        { id: project1.id, type: 'project', title_multiloc: project1.title_multiloc },
        { id: project2.id, type: 'project', title_multiloc: project2.title_multiloc }
      )
    end

    it 'returns root-level folders without space' do
      folder1 = create(:project_folder, space: nil)
      folder2 = create(:project_folder, space: nil)

      result = described_class.new.generate_tree

      expect(result.size).to eq(2)
      folder_nodes = result.select { |node| node[:type] == 'folder' }
      expect(folder_nodes.map { |n| n[:id] }).to contain_exactly(folder1.id, folder2.id)
      expect(folder_nodes.first).to have_key(:children)
    end

    it 'returns spaces with their children' do
      space = create(:space)
      project_in_space = create(:project, space: space)
      folder_in_space = create(:project_folder, space: space)
      root_project = create(:project, space: nil)

      result = described_class.new.generate_tree

      expect(result.size).to eq(2)

      space_node = result.find { |node| node[:type] == 'space' }
      expect(space_node).to include(
        id: space.id,
        type: 'space',
        title_multiloc: space.title_multiloc
      )
      expect(space_node[:children].size).to eq(2)
      expect(space_node[:children].map { |c| c[:id] }).to contain_exactly(project_in_space.id, folder_in_space.id)

      project_node = result.find { |node| node[:id] == root_project.id }
      expect(project_node).to eq({
        id: root_project.id,
        type: 'project',
        title_multiloc: root_project.title_multiloc
      })
    end

    it 'returns folders with their children projects' do
      folder = create(:project_folder, space: nil)
      project_in_folder = create(:project, folder: folder, space: nil)
      root_project = create(:project, space: nil)

      result = described_class.new.generate_tree

      expect(result.size).to eq(2)

      folder_node = result.find { |node| node[:type] == 'folder' }
      expect(folder_node).to include(
        id: folder.id,
        type: 'folder',
        title_multiloc: folder.title_multiloc
      )
      expect(folder_node[:children]).to eq([
        { id: project_in_folder.id, type: 'project', title_multiloc: project_in_folder.title_multiloc }
      ])

      project_node = result.find { |node| node[:id] == root_project.id }
      expect(project_node).to eq({
        id: root_project.id,
        type: 'project',
        title_multiloc: root_project.title_multiloc
      })
    end

    it 'returns nested structure: space > folder > project' do
      space = create(:space)
      folder_in_space = create(:project_folder, space: space)
      project_in_folder = create(:project, folder: folder_in_space, space: space)

      result = described_class.new.generate_tree

      expect(result.size).to eq(1)

      space_node = result.first
      expect(space_node[:type]).to eq('space')
      expect(space_node[:id]).to eq(space.id)
      expect(space_node[:children].size).to eq(1)

      folder_node = space_node[:children].first
      expect(folder_node[:type]).to eq('folder')
      expect(folder_node[:id]).to eq(folder_in_space.id)
      expect(folder_node[:children].size).to eq(1)

      project_node = folder_node[:children].first
      expect(project_node).to eq({
        id: project_in_folder.id,
        type: 'project',
        title_multiloc: project_in_folder.title_multiloc
      })
    end

    it 'does not duplicate projects in spaces' do
      space = create(:space)
      project_in_space = create(:project, space: space)
      create(:project, space: nil)

      result = described_class.new.generate_tree

      # Project in space should only appear as child of space, not at root
      root_project_ids = result.select { |n| n[:type] == 'project' }.map { |n| n[:id] }
      expect(root_project_ids).not_to include(project_in_space.id)

      space_node = result.find { |node| node[:type] == 'space' }
      space_project_ids = space_node[:children].select { |n| n[:type] == 'project' }.map { |n| n[:id] }
      expect(space_project_ids).to include(project_in_space.id)
    end

    it 'does not duplicate folders in spaces' do
      space = create(:space)
      folder_in_space = create(:project_folder, space: space)
      create(:project_folder, space: nil)

      result = described_class.new.generate_tree

      # Folder in space should only appear as child of space, not at root
      root_folder_ids = result.select { |n| n[:type] == 'folder' }.map { |n| n[:id] }
      expect(root_folder_ids).not_to include(folder_in_space.id)

      space_node = result.find { |node| node[:type] == 'space' }
      space_folder_ids = space_node[:children].select { |n| n[:type] == 'folder' }.map { |n| n[:id] }
      expect(space_folder_ids).to include(folder_in_space.id)
    end

    it 'does not duplicate projects in folders' do
      folder = create(:project_folder, space: nil)
      project_in_folder = create(:project, folder: folder, space: nil)
      create(:project)

      result = described_class.new.generate_tree

      # Project in folder should only appear as child of folder, not at root
      root_project_ids = result.select { |n| n[:type] == 'project' }.map { |n| n[:id] }
      expect(root_project_ids).not_to include(project_in_folder.id)

      folder_node = result.find { |node| node[:type] == 'folder' }
      folder_project_ids = folder_node[:children].map { |n| n[:id] }
      expect(folder_project_ids).to include(project_in_folder.id)
    end

    it 'handles complex mixed structure' do
      # Create spaces
      space1 = create(:space)
      space2 = create(:space)

      # Space 1: has a project and a folder with a project
      project_in_space1 = create(:project, space: space1)
      folder_in_space1 = create(:project_folder, space: space1)
      project_in_folder_in_space1 = create(:project, folder: folder_in_space1, space: space1)

      # Space 2: has just a folder with a project
      folder_in_space2 = create(:project_folder, space: space2)
      project_in_folder_in_space2 = create(:project, folder: folder_in_space2, space: space2)

      # Root level: project, folder with project
      root_project = create(:project, space: nil)
      root_folder = create(:project_folder, space: nil)
      project_in_root_folder = create(:project, folder: root_folder, space: nil)

      result = described_class.new.generate_tree

      # Should have 2 spaces + 1 root project + 1 root folder = 4 root items
      expect(result.size).to eq(4)

      # Check space 1 structure
      space1_node = result.find { |node| node[:id] == space1.id }
      expect(space1_node[:children].size).to eq(2)
      expect(space1_node[:children].map { |c| c[:id] }).to contain_exactly(project_in_space1.id, folder_in_space1.id)
      
      folder1_node = space1_node[:children].find { |c| c[:type] == 'folder' }
      expect(folder1_node[:children].size).to eq(1)
      expect(folder1_node[:children].first[:id]).to eq(project_in_folder_in_space1.id)

      # Check space 2 structure
      space2_node = result.find { |node| node[:id] == space2.id }
      expect(space2_node[:children].size).to eq(1)
      
      folder2_node = space2_node[:children].first
      expect(folder2_node[:children].size).to eq(1)
      expect(folder2_node[:children].first[:id]).to eq(project_in_folder_in_space2.id)

      # Check root folder
      root_folder_node = result.find { |node| node[:id] == root_folder.id }
      expect(root_folder_node[:children].size).to eq(1)
      expect(root_folder_node[:children].first[:id]).to eq(project_in_root_folder.id)

      # Check root project
      root_project_node = result.find { |node| node[:id] == root_project.id }
      expect(root_project_node).to eq({
        id: root_project.id,
        type: 'project',
        title_multiloc: root_project.title_multiloc
      })
    end

    it 'returns empty children array for folders without projects' do
      folder = create(:project_folder, space: nil)

      result = described_class.new.generate_tree

      expect(result.size).to eq(1)
      expect(result.first).to eq({
        id: folder.id,
        type: 'folder',
        title_multiloc: folder.title_multiloc,
        children: []
      })
    end

    it 'returns empty children array for spaces without content' do
      space = create(:space)

      result = described_class.new.generate_tree

      expect(result.size).to eq(1)
      expect(result.first).to eq({
        id: space.id,
        type: 'space',
        title_multiloc: space.title_multiloc,
        children: []
      })
    end

    it 'handles folders with multiple children' do
      folder = create(:project_folder, space: nil)
      project1 = create(:project, folder: folder, space: nil)
      project2 = create(:project, folder: folder, space: nil)
      project3 = create(:project, folder: folder, space: nil)

      result = described_class.new.generate_tree

      folder_node = result.first
      expect(folder_node[:children].size).to eq(3)
      expect(folder_node[:children].map { |c| c[:id] }).to contain_exactly(project1.id, project2.id, project3.id)
    end

    it 'handles spaces with multiple direct children' do
      space = create(:space)
      project1 = create(:project, space: space)
      project2 = create(:project, space: space)
      folder1 = create(:project_folder, space: space)
      folder2 = create(:project_folder, space: space)

      result = described_class.new.generate_tree

      space_node = result.first
      expect(space_node[:children].size).to eq(4)
      expect(space_node[:children].map { |c| c[:id] }).to contain_exactly(project1.id, project2.id, folder1.id, folder2.id)
    end
  end
end
