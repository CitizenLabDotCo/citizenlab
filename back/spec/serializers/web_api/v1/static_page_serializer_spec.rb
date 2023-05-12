# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::StaticPageSerializer do
  context 'nav_bar_item_title_multiloc' do
    it 'corresponds to the nav bar item title, if the nav bar item exists' do
      expected_title = { 'en' => 'Fallback title', 'fr-BE' => 'Titre de remplacement' }
      page = create(:static_page)
      create(:nav_bar_item, code: 'custom', static_page: page)
      expect(page.reload.nav_bar_item).to receive(:title_multiloc_with_fallback).and_return(expected_title)

      serialized_output = described_class.new(page).serializable_hash
      expect(serialized_output.dig(:data, :attributes, :nav_bar_item_title_multiloc)).to match expected_title
    end

    it 'corresponds to what the nav bar item title will look like, if no nav bar item exists' do
      expected_title = { 'en' => 'Fallback title', 'nl-BE' => 'Vervangingstitel' }
      page = create(:static_page, code: 'custom', title_multiloc: expected_title)

      serialized_output = described_class.new(page).serializable_hash
      expect(serialized_output.dig(:data, :attributes, :nav_bar_item_title_multiloc)).to match expected_title
    end
  end
end
