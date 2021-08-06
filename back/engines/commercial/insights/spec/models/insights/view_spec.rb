# frozen_string_literal: true

require 'rails_helper'

describe 'Insights::View' do
  describe 'validations' do
    subject(:view) { build(:view) }

    specify { expect(view).to be_valid }

    it 'is not valid without a name' do
      view.name = nil
      expect(view).not_to be_valid
    end

    it 'is not valid with an empty name' do
      view.name = ''
      expect(view).not_to be_valid
    end

    it 'is not valid if the name is already taken' do
      create(:view, name: view.name)
      expect(view).not_to be_valid
    end
  end

  describe 'associations' do
    subject(:view) { build(:view) }

    it { expect(view).to have_many(:tna_tasks_views).dependent(:destroy) }
    it { expect(view).to have_many(:categories).dependent(:destroy) }
    it { expect(view).to have_many(:text_networks).dependent(:destroy) }
    it { expect(view).to have_many(:processed_flags).dependent(:destroy) }

    context 'when associated project-scope is deleted' do
      before do
        view.save!
        view.scope.destroy!
      end

      it { expect { view.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end
  end
end
