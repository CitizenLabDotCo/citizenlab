# frozen_string_literal: true

require 'rails_helper'

describe Insights::View do
  subject(:view) { build(:view) }

  describe 'factory' do
    it { is_expected.to be_valid }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
  end

  describe 'associations' do
    it { is_expected.to have_many(:data_sources).dependent(:destroy) }
    it { is_expected.to have_many(:source_projects).through(:data_sources).source(:origin) }
    it { is_expected.to have_many(:tna_tasks_views).dependent(:destroy) }
    it { is_expected.to have_many(:categories).dependent(:destroy).order(position: :desc) }
    it { is_expected.to have_many(:category_assignments).through(:categories) }
    it { is_expected.to have_many(:text_networks).dependent(:destroy) }
    it { is_expected.to have_many(:processed_flags).dependent(:destroy) }

    context 'when associated origin is deleted' do
      before do
        view.save!
        view.data_sources.first.origin.destroy!
      end

      it { expect { view.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end
  end
end
