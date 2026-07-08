# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::MultilocMerge do
  subject(:host) { Class.new { include McpServer::BaseTool::MultilocMerge }.new }

  def merge(record, attributes)
    host.send(:merge_multilocs, record, attributes)
  end

  let(:project) { build(:project, title_multiloc: { 'en' => 'Hi', 'fr-FR' => 'Bonjour' }) }

  it 'merges multiloc values per locale, keeping locales the caller did not pass' do
    merged = merge(project, title_multiloc: { 'fr-FR' => 'Salut', 'nl-BE' => 'Hallo' })

    expect(merged).to eq(
      title_multiloc: { 'en' => 'Hi', 'fr-FR' => 'Salut', 'nl-BE' => 'Hallo' }
    )
  end

  it 'uses the incoming value verbatim when the current value is blank' do
    project.title_multiloc = {}

    merged = merge(project, title_multiloc: { 'en' => 'New' })

    expect(merged).to eq(title_multiloc: { 'en' => 'New' })
  end

  it 'passes non-multiloc attributes through unchanged' do
    merged = merge(
      project,
      title_multiloc: { 'en' => 'New' }, listed: false, slug: 'new-slug'
    )

    expect(merged).to eq(
      title_multiloc: { 'en' => 'New', 'fr-FR' => 'Bonjour' },
      listed: false,
      slug: 'new-slug'
    )
  end
end
