# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminPublication do
  subject(:admin_publication) { create(:admin_publication) }

  describe 'create(:admin_publication)' do
    it 'is valid' do
      expect(admin_publication).to be_valid
    end
  end

  describe '#depth' do
    it 'sets depth of 0 by default' do
      expect(admin_publication.depth).to eq 0
    end

    it 'sets depth of 1 to a direct child' do
      admin_publication = create(:admin_publication, publication: create(:idea))
      child_publication = create(:admin_publication)
      admin_publication.children << child_publication
      admin_publication.save

      expect(child_publication.depth).to eq 1
    end
  end

  describe '#children_allowed?' do
    it 'is true by default for a publication that is not a project' do
      publication = create(:admin_publication, publication: create(:idea))
      expect(publication.children_allowed?).to be true
    end

    it 'is false for a project' do
      expect(admin_publication.children_allowed?).to be false
    end

    it 'allows the creation of children for a non project admin publication' do
      admin_publication = create(:admin_publication, publication: create(:idea))
      child_publication = create(:admin_publication)
      admin_publication.children << child_publication
      expect(admin_publication).to be_valid
    end

    it 'does not allow the creation of children for a project admin publication' do
      child_publication = create(:admin_publication)
      admin_publication.children << child_publication
      expect(child_publication).not_to be_valid
    end
  end
end
