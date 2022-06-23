# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NavBarItem, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:nav_bar_item)).to be_valid
    end
  end

  describe 'title_multiloc_with_fallback' do
    context 'with default items' do
      it "falls back to the translations when there's no title_multiloc" do
        item = create :nav_bar_item, code: 'home', title_multiloc: nil
        expect(item.title_multiloc_with_fallback).to match({ 'en' => 'Home', 'fr-FR' => 'Accueil', 'nl-NL' => 'Home' })
      end

      it 'returns the custom copy for locales with custom copy and falls back to the translations for other locales' do
        item = create(:nav_bar_item, code: 'home', title_multiloc: { 'nl-NL' => 'Thuis' })
        expect(item.title_multiloc_with_fallback).to match({ 'en' => 'Home', 'fr-FR' => 'Accueil', 'nl-NL' => 'Thuis' })
      end
    end

    context 'with custom items' do
      it 'returns the custom copy for locales with custom copy and falls back to the page title for other locales' do
        page = create(:static_page, title_multiloc: { 'en' => 'How to take part', 'fr-FR' => 'Comment participer' })
        item = create(:nav_bar_item, static_page: page, title_multiloc: { 'en' => 'How to participate' })
        expected_title = { 'en' => 'How to participate', 'fr-FR' => 'Comment participer' }
        expect(item.title_multiloc_with_fallback).to match expected_title
      end
    end
  end

  describe 'translations' do
    (NavBarItem::CODES - ['custom']).each do |code|
      it "exist for #{code} title" do
        key = "nav_bar_items.#{code}.title"
        expect(I18n.exists?(key)).to be true
      end
    end
  end
end
