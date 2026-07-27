# frozen_string_literal: true

# Real Decidim exports don't include a participatory-process user-roles CSV (and ExportReader doesn't
# read one), so ProcessRolesExtractor + RoleAssigner — the deferred project-moderator assignment that
# runs after deserialization in Importer#import — are exercised only against the synthetic rows here.
# Projects, phases and folders have real `decidim_export/` fixtures covered by their own specs.

require 'rails_helper'
require_relative '../../fixtures/sample_data'

RSpec.describe DecidimImporter::Importer do
  it 'assigns a participatory-process admin as a Go Vocal project moderator' do
    described_class.new(DecidimImporter::SampleData.all).import

    project = Project.where("title_multiloc->>'fr-FR' = ?", 'Budget participatif 2021').first
    expect(project).to be_present

    henri = User.find_by(unique_code: 'decidim-user-2')
    expect(henri.project_moderator?(project.id)).to be(true)
  end
end
