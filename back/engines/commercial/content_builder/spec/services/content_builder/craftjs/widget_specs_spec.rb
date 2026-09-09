# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::Craftjs::WidgetSpecs do
  describe 'PROJECT_PAGE_SPECS' do
    # A project page has no resolver entry for a custom page widget, and craft.js throws on an
    # unknown resolvedName inside a pass over every node — so letting one through here does not
    # drop a widget, it takes the whole route down for every visitor.
    it 'holds none of the custom page widgets' do
      expect(described_class::PROJECT_PAGE_SPECS.keys)
        .not_to include(*described_class::CUSTOM_PAGE_WIDGETS)
    end

    it 'holds everything else the full specs do' do
      expect(described_class::PROJECT_PAGE_SPECS.keys)
        .to match_array(described_class::SPECS.keys - described_class::CUSTOM_PAGE_WIDGETS)
    end

    # Naming a widget that no longer exists would silently stop excluding anything.
    it 'names only widgets that are actually specified' do
      expect(described_class::SPECS.keys).to include(*described_class::CUSTOM_PAGE_WIDGETS)
    end
  end

  describe 'CUSTOM_PAGE_WIDGETS' do
    it 'covers what the custom page layout service derives' do
      derived = ContentBuilder::CustomPageLayoutService.new
        .craftjs_json_for(build(:static_page))
        .values
        .filter_map { |node| node.dig('type', 'resolvedName') }

      custom_page_only = derived.uniq & described_class::CUSTOM_PAGE_WIDGETS
      expect(custom_page_only).to include('CustomPageRoot', 'CustomPageBody')
    end
  end
end
