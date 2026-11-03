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
  end

  describe 'stamps' do
    it 'round-trips every row' do
      stamp = described_class.all.to_stamp
      expect(stamp).to eq 'all'
      expect(described_class.from_stamp(stamp)).to eq described_class.all
    end

    it 'round-trips a set of projects, in any order' do
      scope = described_class.new(project_ids: %w[a b])
      expect(described_class.from_stamp({ 'project_ids' => %w[b a] })).to eq scope
      expect(described_class.from_stamp(scope.to_stamp)).to eq scope
    end

    it 'refuses a stamp it does not know' do
      expect { described_class.from_stamp({}) }.to raise_error(KeyError)
    end
  end

  describe '#within?' do
    using RSpec::Parameterized::TableSyntax

    # A stored result's scope (its stamp), against the scope of the user who wants to
    # reuse it. P1 and P2 are projects.
    def scope(ids) = ids == :all ? described_class.all : described_class.new(project_ids: ids)

    where(:case_name, :stamp, :user_scope, :within) do
      'an admin reuses an admin result'    | :all      | :all      | true
      'an admin reuses a moderator result' | %w[P1]    | :all      | true
      'a moderator reuses an admin result' | :all      | %w[P1]    | false
      'a moderator gained a project since' | %w[P1]    | %w[P1 P2] | true
      'a moderator lost a project since'   | %w[P1 P2] | %w[P1]    | false
      'the result reads no project'        | []        | %w[P1]    | true
      'the user may analyse no project'    | %w[P1]    | []        | false
    end

    with_them do
      it 'is true only when the user can read every row the result reads' do
        expect(scope(stamp).within?(scope(user_scope))).to eq within
      end
    end
  end
end
