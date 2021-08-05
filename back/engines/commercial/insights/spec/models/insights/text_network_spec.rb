# frozen_string_literal: true

require 'rails_helper'

describe Insights::TextNetwork do
  describe 'validation' do
    subject(:text_network) { build(:insights_text_network) }

    specify { expect(text_network).to be_valid }

    it 'fails without language' do
      text_network.language = nil
      expect(text_network).not_to be_valid
    end

    it 'fails without network' do
      text_network.network = nil
      expect(text_network).not_to be_valid
    end

    it 'fails without view' do
      text_network.view = nil
      expect(text_network).not_to be_valid
    end

    context 'when a network with same language and view already exists' do
      before do
        text_network.save!
      end

      it 'fails' do
        another_network = build(:insights_text_network, view: text_network.view, language: text_network.language)
        expect(another_network).not_to be_valid
      end
    end
  end

  describe 'associations' do
    subject(:text_network) { create(:insights_text_network) }

    context 'when its view is deleted' do
      before { text_network.view.destroy! }

      it "text network gets deleted" do 
        expect { text_network.reload }.to raise_error(ActiveRecord::RecordNotFound) 
      end
    end
  end
end
