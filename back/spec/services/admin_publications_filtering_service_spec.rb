# frozen_string_literal: true

require 'rails_helper'

describe AdminPublicationsFilteringService do
  subject(:result) { described_class.new.filter(base_scope, options) }

  let_it_be(:tree_mock) { MockAdminPublicationsTree.call }

  shared_examples 'when a user searching from the home page' do
    it 'includes truly empty parents' do
      expect(result.ids).to include(*tree_mock.empty_parents.where(publication_status: %w[archived published]).ids)
    end

    it 'does not include empty draft parents' do
      expect(result.ids).not_to include(*tree_mock.empty_parents.where(publication_status: %w[draft]).ids)
    end

    it 'includes other top-level published publications' do
      expect(result.ids).to include(*tree_mock.other.where(publication_status: %w[archived published]).ids)
    end

    it 'does not include other top-level draft publications' do
      expect(result.ids).not_to include(*tree_mock.other.where(publication_status: %w[draft]).ids)
    end

    it 'does not include a parent if all its children are in draft' do
      expect(result.ids).not_to include(tree_mock.published_parent_with_draft_children.id)
    end

    it 'does not include the draft children of a published parent' do
      expect(result.ids).not_to include(*tree_mock.published_parent_with_draft_children.children.ids)
    end
  end

  context 'when a normal user searching from the home page' do
    let(:options) { { depth: 0, remove_not_allowed_parents: true, publication_statuses: %w[archived published] } }
    let(:base_scope) { Pundit.policy_scope(create(:user), AdminPublication.includes(:parent)) }

    include_examples 'when a user searching from the home page'

    it 'does not include parents when the user has no access to its children' do
      expect(result.ids).not_to include(*tree_mock.admin_only_parents.ids)
    end
  end

  context 'when an admin searching from the home page' do
    let(:options) { { depth: '0', remove_not_allowed_parents: 'true', publication_statuses: %w[archived published] } }
    let(:base_scope) { Pundit.policy_scope(create(:admin), AdminPublication.includes(:parent)) }

    include_examples 'when a user searching from the home page'

    it 'does include parents when the admin has access to its children' do
      # we use not_draft because we filter out draft projects by publication_statuses param
      expect(result.ids).to include(*tree_mock.admin_only_parents.not_draft.ids)
    end
  end

  context 'when an admin searching from the admin dashboard' do
    let(:base_scope) { Pundit.policy_scope(create(:admin), AdminPublication.includes(:parent)) }
    let(:options) { {} }

    it 'includes all publications' do
      expect(result.ids).to include(*AdminPublication.ids)
    end
  end

  context 'when filtering by spaces' do
    let(:base_scope) { AdminPublication.includes(:parent) }
    let(:options) { { spaces: [space_a.id] } }

    let_it_be(:space_a) { create(:space) }
    let_it_be(:space_b) { create(:space) }

    # Top-level projects, one per space
    let_it_be(:project_a) { create(:project, space: space_a) }
    let_it_be(:project_b) { create(:project, space: space_b) }

    # A folder per space, each containing a project in the same space
    let_it_be(:nested_project_a) { create(:project, space: space_a) }
    let_it_be(:folder_a) { create(:project_folder, space: space_a, projects: [nested_project_a]) }
    let_it_be(:nested_project_b) { create(:project, space: space_b) }
    let_it_be(:folder_b) { create(:project_folder, space: space_b, projects: [nested_project_b]) }

    it 'includes the projects and folders that belong to the given space' do
      expect(result.map(&:publication_id)).to include(project_a.id, folder_a.id, nested_project_a.id)
    end

    it 'does not leak projects from other spaces' do
      expect(result.map(&:publication_id)).not_to include(project_b.id, nested_project_b.id)
    end

    it 'does not leak folders from other spaces' do
      expect(result.map(&:publication_id)).not_to include(folder_b.id)
    end

    it 'does not leak space-less publications from the mocked tree' do
      space_less_ids = AdminPublication.where(publication_id: Project.where(space_id: nil)).ids
      expect(result.ids).not_to include(*space_less_ids)
    end
  end
end
