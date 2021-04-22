require 'rails_helper'

describe AdminPublicationsFilteringService do
  subject(:result) { described_class.new.filter(base_scope, options) }

  before { AdminPublication.destroy_all }

  let!(:tree_mock) { MockAdminPublicationsTree.call }

  shared_examples 'when a normal user searching from the landing page' do
    let(:base_scope) { Pundit.policy_scope(create(:user), AdminPublication.includes(:parent)) }

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

    it 'does not include parents when the user has no access to it\'s children' do
      expect(result.ids).not_to include(*tree_mock.admin_only_parents.ids)
    end

    it 'includes a parent even if it\'s children are in draft' do
      expect(result.ids).to include(tree_mock.published_parent_with_draft_children.id)
    end

    it 'does not include the draft children of a published parent' do
      expect(result.ids).not_to include(*tree_mock.draft_children_of_published_parent.ids)
    end
  end

  context 'when a normal user searching from the landing page (passing parsed params)' do
    let(:options) { { depth: 0, remove_not_allowed_parents: true, publication_statuses: %w[archived published] } }

    include_examples 'when a normal user searching from the landing page'
  end

  context 'when a normal user searching from the landing page (passing params as strings)' do
    let(:options) { { depth: '0', remove_not_allowed_parents: 'true', publication_statuses: %w[archived published] } }

    include_examples 'when a normal user searching from the landing page'
  end

  context 'when an admin searching from the admin dashboard' do
    let(:base_scope) { Pundit.policy_scope(create(:admin), AdminPublication.includes(:parent)) }
    let(:options) { {} }

    it 'includes all publications' do
      expect(result.ids).to include(*AdminPublication.ids)
    end
  end
end
