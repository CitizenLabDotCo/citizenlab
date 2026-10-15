# frozen_string_literal: true

require 'rails_helper'

describe Facets::IdeaStatus do
  describe '#counts' do
    let(:status1) { create(:idea_status) }
    let(:status2) { create(:idea_status) }

    before do
      create_list(:idea, 2, idea_status: status1)
      create(:idea, idea_status: status2)
    end

    it 'counts the ideas per status' do
      expect(described_class.new.counts(Idea.all)).to eq({ status1.id => 2, status2.id => 1 })
    end

    it 'only counts the ideas in the scope' do
      expect(described_class.new.counts(Idea.where(idea_status: status2))).to eq({ status2.id => 1 })
    end
  end
end
