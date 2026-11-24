# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Serializers::NavBarItem do
  let(:project) { create(:project, title_multiloc: { 'en' => 'Park renewal' }) }

  it 'returns the raw override, or null when unset, next to the displayed label' do
    item = create(:nav_bar_item, static_page: nil, project:, title_multiloc: nil)
    overridden = create(:nav_bar_item, title_multiloc: { 'en' => 'About' })

    expect(described_class.serialize(item)).to include(
      title_multiloc: nil,
      display_title_multiloc: { 'en' => 'Park renewal' }
    )
    expect(described_class.serialize(overridden)).to include(
      title_multiloc: { 'en' => 'About' },
      display_title_multiloc: hash_including('en' => 'About')
    )
  end

  it 'does the same for the children of a dropdown' do
    dropdown = create(:nav_bar_item, :dropdown)
    create(:nav_bar_item, parent: dropdown, static_page: nil, project:, title_multiloc: nil)

    child = described_class.serialize(dropdown)[:children].sole

    expect(child).to include(title_multiloc: nil, display_title_multiloc: { 'en' => 'Park renewal' })
  end
end
