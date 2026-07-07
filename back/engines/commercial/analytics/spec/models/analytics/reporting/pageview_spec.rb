# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::Pageview do
  it 'exposes one row per pageview with its session and project' do
    project = create(:project)
    pageview = create(:pageview, path: '/en/projects/park-renewal', project_id: project.id)
    row = described_class.find(pageview.id)

    expect(row.session_id).to eq pageview.session_id
    expect(row.viewed_at).to eq pageview.created_at
    expect(row.path).to eq '/en/projects/park-renewal'
    expect(row.project_id).to eq project.id
  end

  describe 'locale' do
    it 'parses a configured locale from the path' do
      expect(described_class.find(create(:pageview, path: '/fr-FR/ideas').id).locale).to eq 'fr-FR'
    end

    it 'is NULL when the path segment is not a configured locale' do
      expect(described_class.find(create(:pageview, path: '/xx/ideas').id).locale).to be_nil
      expect(described_class.find(create(:pageview, path: '/').id).locale).to be_nil
    end
  end
end
