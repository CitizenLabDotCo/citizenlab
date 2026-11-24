# frozen_string_literal: true

require 'rails_helper'

RSpec.describe McpServer::QueryScope do
  describe '.for' do
    let!(:project) { create(:project) }

    before { create(:project) }

    it 'gives an admin every row' do
      expect(described_class.for(create(:admin))).to be_all
    end

    it 'gives a blocked admin no rows' do
      scope = described_class.for(create(:admin, block_end_at: 1.day.from_now))
      expect(scope.project_ids).to eq []
    end

    it 'gives a moderator the projects they moderate' do
      scope = described_class.for(create(:project_moderator, projects: [project]))
      expect(scope.project_ids).to eq [project.id]
    end

    it 'gives a folder moderator the projects in their folder' do
      folder = create(:project_folder)
      in_folder = create(:project, folder: folder)
      scope = described_class.for(create(:project_folder_moderator, project_folders: [folder]))
      expect(scope.project_ids).to eq [in_folder.id]
    end

    it 'gives a space moderator the projects in their space, sorted' do
      space = create(:space)
      in_space = [create(:project, space: space), create(:project, folder: create(:project_folder, space: space))]
      scope = described_class.for(create(:space_moderator, spaces: [space]))
      expect(scope.project_ids).to eq in_space.map(&:id).sort
    end

    it 'gives a resident no rows' do
      expect(described_class.for(create(:user)).project_ids).to eq []
    end

    it 'gives no user no rows' do
      expect(described_class.for(nil).project_ids).to eq []
    end

    describe 'within some projects' do
      let(:other_project) { create(:project) }

      it 'limits an admin to them' do
        expect(described_class.for(create(:admin), within: [project.id]).project_ids).to eq [project.id]
      end

      it 'limits a moderator to the ones they moderate' do
        moderator = create(:project_moderator, projects: [project, other_project])

        expect(described_class.for(moderator, within: [project.id]).project_ids).to eq [project.id]
      end

      it 'gives a moderator of other projects no rows' do
        moderator = create(:project_moderator, projects: [other_project])

        expect(described_class.for(moderator, within: [project.id]).project_ids).to eq []
      end
    end
  end

  describe '#limited_to' do
    using RSpec::Parameterized::TableSyntax

    def scope(ids) = ids == :all ? described_class.all : described_class.new(project_ids: ids)

    where(:case_name, :from, :limit, :result) do
      'every row, to one project'          | :all      | %w[P1]       | %w[P1]
      'every row, to no project'           | :all      | []           | []
      'a moderator, to their project'      | %w[P1 P2] | %w[P1]       | %w[P1]
      'a moderator, to another project'    | %w[P1]    | %w[P2]       | []
      'a moderator, sorted and unrepeated' | %w[P3 P1] | %w[P3 P1 P1] | %w[P1 P3]
    end

    with_them do
      it 'keeps only the rows of those projects that the scope already reads' do
        expect(scope(from).limited_to(limit)).to eq scope(result)
      end
    end
  end
end
