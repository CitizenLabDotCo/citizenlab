# frozen_string_literal: true

require 'rails_helper'

describe NavBarItemService do
  let(:service) { described_class.new }
  let(:default_codes) { NavBarItem::CODES - ['custom'] }

  # place default when all others present in correct order with custom after
  # place with missing defaults before
  # place with custom before
  # place without custom before but wrong order defaults before
  # place wrong order but all customs after
  # place when no other defaults (before)

  # [home projects proposals events all_input custom]

  describe '#auto_reposition!' do
    it 'positions within defaults when all defaults are present in correct order' do
      %w[home projects all_input custom].each { |c| create(:nav_bar_item, code: c) }
      item = create(:nav_bar_item, code: 'events')
      service.auto_reposition! item
      expect(NavBarItem.order(:ordering).pluck(:code)).to eq %w[home projects events all_input custom]
    end

    it 'positions within defaults when some defaults are missing but present in correct order' do
      %w[projects all_input].each { |c| create(:nav_bar_item, code: c) }
      item = create(:nav_bar_item, code: 'events')
      service.auto_reposition! item
      expect(NavBarItem.order(:ordering).pluck(:code)).to eq %w[projects events all_input]
    end

    it 'positions at the end when custom items occur before desired position' do
      %w[custom projects all_input custom].each { |c| create(:nav_bar_item, code: c) }
      item = create(:nav_bar_item, code: 'events')
      service.auto_reposition! item
      expect(NavBarItem.order(:ordering).pluck(:code)).to eq %w[custom projects all_input custom events]
    end

    it 'positions behind defaults when default items are not in right order but all custom items occur at the end' do
      %w[projects all_input home custom custom].each { |c| create(:nav_bar_item, code: c) }
      item = create(:nav_bar_item, code: 'events')
      service.auto_reposition! item
      expect(NavBarItem.order(:ordering).pluck(:code)).to eq %w[projects all_input home events custom custom]
    end

    it 'positions within defaults when sequences occur behind desired position' do
      %w[home all_input custom events].each { |c| create(:nav_bar_item, code: c) }
      item = create(:nav_bar_item, code: 'projects')
      service.auto_reposition! item
      expect(NavBarItem.order(:ordering).pluck(:code)).to eq %w[home projects all_input custom events]
    end

    it 'positions before custom items when there are no default items' do
      create(:nav_bar_item, code: 'custom')
      item = create(:nav_bar_item, code: 'home')
      service.auto_reposition! item
      expect(NavBarItem.order(:ordering).pluck(:code)).to eq %w[home custom]
    end
  end
end
