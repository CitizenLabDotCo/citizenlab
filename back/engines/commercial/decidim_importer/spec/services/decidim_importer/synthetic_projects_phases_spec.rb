# frozen_string_literal: true

# The real Decidim export shipped so far doesn't include participatory-processes / steps /
# user-roles CSVs, so this spec exercises those extractors and the full pipeline (deserializer +
# role-assigner) against synthetic rows whose schema mirrors the extractor `COLUMNS` constants.
# Replace with real fixture-driven coverage once those files land.

require 'rails_helper'
require_relative '../../fixtures/sample_data'

RSpec.describe DecidimImporter::Importer do
  let(:rows_by_model) { DecidimImporter::SampleData.all }

  def find_project(title)
    Project.where("title_multiloc->>'fr-FR' = ?", title).first
  end

  it 'applies users, folders, projects, phases and project moderator roles' do
    importer = described_class.new(rows_by_model)
    importer.import

    expect(User.where(unique_code: %w[decidim-user-1 decidim-user-2]).count).to eq(2)

    folder = ProjectFolders::Folder.where("title_multiloc->>'fr-FR' = ?", 'Environnement').first
    expect(folder).to be_present

    pb = find_project('Budget participatif 2021')
    expect(pb.admin_publication.publication_status).to eq('published')
    expect(pb.admin_publication.parent.publication).to eq(folder)
    expect(pb.phases.count).to eq(2)
    expect(pb.phases.pluck(:participation_method).uniq).to eq(%w[information])

    pm = find_project('Concertation mobilité')
    expect(pm.admin_publication.publication_status).to eq('draft')
    expect(pm.admin_publication.parent).to be_nil

    expect(importer.skipped_phases.map { |s| s[:uid] }).to include('decidim-step-1002')

    henri = User.find_by(unique_code: 'decidim-user-2')
    expect(henri.project_moderator?(pb.id)).to be(true)
  end
end
