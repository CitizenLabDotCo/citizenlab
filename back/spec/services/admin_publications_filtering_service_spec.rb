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
end
