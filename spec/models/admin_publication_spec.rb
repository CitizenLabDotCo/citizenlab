require 'rails_helper'

RSpec.describe AdminPublication, type: :model do
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
      child_publication = create(:admin_publication)
      admin_publication.children << child_publication
      admin_publication.save

      expect(child_publication.depth).to eq 1
    end
  end
end
