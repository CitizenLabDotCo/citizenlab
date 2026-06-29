# frozen_string_literal: true

require 'rails_helper'

RSpec.describe NavBarItem do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:nav_bar_item)).to be_valid
    end
  end

  describe 'title_multiloc_with_fallback' do
    context 'with default items' do
      it "falls back to the translations when there's no title_multiloc" do
        item = create(:nav_bar_item, code: 'home', title_multiloc: nil)
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
    # 'custom' and 'menu' items always carry a user-provided title, so they
    # have no i18n fallback key.
    (NavBarItem::CODES - %w[custom menu]).each do |code|
      it "exist for #{code} title" do
        key = "nav_bar_items.#{code}.title"
        expect(I18n.exists?(key)).to be true
      end
    end
  end

  describe 'dropdown (menu) items' do
    it 'is valid as a title-only parent' do
      expect(build(:nav_bar_item, :menu)).to be_valid
    end

    it 'is invalid when it links to a target' do
      expect(build(:nav_bar_item, :menu, static_page: create(:static_page))).not_to be_valid
    end

    it 'is invalid when nested under another item' do
      menu = create(:nav_bar_item, :menu)
      expect(build(:nav_bar_item, :menu, parent: menu)).not_to be_valid
    end

    it 'requires a child\'s parent to be a menu item' do
      non_menu = create(:nav_bar_item, code: 'custom', static_page: create(:static_page))
      child = build(:nav_bar_item, code: 'custom', parent: non_menu, static_page: create(:static_page))
      expect(child).not_to be_valid
    end

    it 'allows up to 5 children but not more' do
      menu = create(:nav_bar_item, :menu)
      5.times do
        create(:nav_bar_item, code: 'custom', parent: menu, static_page: create(:static_page))
      end
      sixth = build(:nav_bar_item, code: 'custom', parent: menu, static_page: create(:static_page))
      expect(sixth).not_to be_valid
    end

    it 'orders children within the parent scope independently of top-level items' do
      create(:nav_bar_item, code: 'home')
      menu = create(:nav_bar_item, :menu)
      first = create(:nav_bar_item, code: 'custom', parent: menu, static_page: create(:static_page))
      second = create(:nav_bar_item, code: 'custom', parent: menu, static_page: create(:static_page))
      expect([first.reload.ordering, second.reload.ordering]).to eq [0, 1]
    end
  end
end
