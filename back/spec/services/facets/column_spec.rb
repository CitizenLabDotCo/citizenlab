# frozen_string_literal: true

require 'rails_helper'

describe Facets::Column do
  subject(:facet) { described_class.new(:idea_status_id) }

  let(:status1) { create(:idea_status) }
  let(:status2) { create(:idea_status) }

  before do
    create_list(:idea, 2, idea_status: status1)
    create(:idea, idea_status: status2)
  end

  describe '#key' do
    it 'is the column name' do
      expect(facet.key).to eq 'idea_status_id'
    end
  end

  describe '#counts' do
    it 'counts the records per value of the column' do
      expect(facet.counts(Idea.all)).to eq({ status1.id => 2, status2.id => 1 })
    end

    it 'only counts the records in the scope' do
      expect(facet.counts(Idea.where(idea_status: status2))).to eq({ status2.id => 1 })
    end
  end
end
