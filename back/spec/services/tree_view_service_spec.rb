# frozen_string_literal: true

# filepath: /Users/work/cl/citizenlab/back/spec/services/tree_view_service_spec.rb

require 'rails_helper'

describe TreeViewService do
  describe '#generate_tree' do
    let(:space) { create(:space) }
    let(:other_space) { create(:space) }

    context 'without space_id filter' do
      it 'returns an empty array when there are no publications' do
        result = described_class.new.generate_tree
        expect(result).to eq([])
      end

      it 'returns root-level projects' do
        project1 = create(:project)
        project2 = create(:project)

        result = described_class.new.generate_tree

        expect(result.size).to eq(2)
        expect(result).to include(
          { id: project1.id, type: 'project', title_multiloc: project1.title_multiloc },
          { id: project2.id, type: 'project', title_multiloc: project2.title_multiloc }
        )
      end

      it 'returns folders with their children projects' do
        folder = create(:project_folder)
        project_in_folder = create(:project, folder: folder)
        root_project = create(:project)

        result = described_class.new.generate_tree

        expect(result.size).to eq(2)

        folder_node = result.find { |node| node[:type] == 'folder' }
        expect(folder_node).to eq({
          id: folder.id,
          type: 'folder',
          title_multiloc: folder.title_multiloc,
          children: [
            { id: project_in_folder.id, type: 'project', title_multiloc: project_in_folder.title_multiloc }
          ]
        })

        project_node = result.find { |node| node[:id] == root_project.id }
        expect(project_node).to eq({
          id: root_project.id,
          type: 'project',
          title_multiloc: root_project.title_multiloc
        })
      end

      it 'returns folders without children when they have no projects' do
        folder = create(:project_folder)

        result = described_class.new.generate_tree

        expect(result.size).to eq(1)
        expect(result.first).to eq({
          id: folder.id,
          type: 'folder',
          title_multiloc: folder.title_multiloc,
          children: []
        })
      end

      it 'orders publications by left value (nested set order)' do
        project1 = create(:project)
        folder = create(:project_folder)
        project2 = create(:project)

        # Manually set the left values to ensure order
        AdminPublication.find_by(publication: project1).update_column(:lft, 1)
        AdminPublication.find_by(publication: folder).update_column(:lft, 2)
        AdminPublication.find_by(publication: project2).update_column(:lft, 3)

        result = described_class.new.generate_tree

        expect(result.map { |node| node[:id] }).to eq([project1.id, folder.id, project2.id])
      end
    end

    context 'with space_id filter' do
      it 'returns an empty array when there are no publications in space' do
        create(:project)
        result = described_class.new(space_id: space.id).generate_tree
        expect(result).to eq([])
      end

      it 'returns only projects in the specified space' do
        project_in_space = create(:project, space: space)
        create(:project, space: other_space)

        result = described_class.new(space_id: space.id).generate_tree

        expect(result.size).to eq(1)
        expect(result.first).to eq({
          id: project_in_space.id,
          type: 'project',
          title_multiloc: project_in_space.title_multiloc
        })
      end

      it 'returns only folders in the specified space' do
        folder_in_space = create(:project_folder, space: space)
        create(:project_folder, space: other_space)

        result = described_class.new(space_id: space.id).generate_tree

        expect(result.size).to eq(1)
        expect(result.first[:id]).to eq(folder_in_space.id)
      end

      it 'filters children projects by space_id' do
        folder = create(:project_folder, space: space)
        project_in_space = create(:project, space: space, folder: folder)
        create(:project, space: other_space)

        result = described_class.new(space_id: space.id).generate_tree

        expect(result.size).to eq(1)
        folder_node = result.first
        expect(folder_node[:children].size).to eq(1)
        expect(folder_node[:children].first[:id]).to eq(project_in_space.id)
      end

      it 'handles mixed space assignments correctly' do
        project_in_space = create(:project, space: space)
        folder_in_space = create(:project_folder, space: space)
        project_in_folder_in_space = create(:project, space: space, folder: folder_in_space)
        create(:project, space: other_space)
        create(:project_folder, space: other_space)

        result = described_class.new(space_id: space.id).generate_tree

        expect(result.size).to eq(2)
        expect(result.map { |node| node[:id] }).to contain_exactly(project_in_space.id, folder_in_space.id)

        folder_node = result.find { |node| node[:type] == 'folder' }
        expect(folder_node[:children].size).to eq(1)
        expect(folder_node[:children].first[:id]).to eq(project_in_folder_in_space.id)
      end
    end

    context 'edge cases' do
      it 'handles folders with multiple children' do
        folder = create(:project_folder)
        project1 = create(:project, folder: folder)
        project2 = create(:project, folder: folder)
        project3 = create(:project, folder: folder)

        result = described_class.new.generate_tree

        folder_node = result.first
        expect(folder_node[:children].size).to eq(3)
        expect(folder_node[:children].map { |c| c[:id] }).to contain_exactly(project1.id, project2.id, project3.id)
      end

      it 'handles projects without space_id' do
        project_with_space = create(:project, space: space)
        create(:project, space: nil)

        result = described_class.new(space_id: space.id).generate_tree

        expect(result.size).to eq(1)
        expect(result.first[:id]).to eq(project_with_space.id)
      end

      it 'handles folders without space_id' do
        folder_with_space = create(:project_folder, space: space)
        create(:project_folder, space: nil)

        result = described_class.new(space_id: space.id).generate_tree

        expect(result.size).to eq(1)
        expect(result.first[:id]).to eq(folder_with_space.id)
      end
    end
  end
end
