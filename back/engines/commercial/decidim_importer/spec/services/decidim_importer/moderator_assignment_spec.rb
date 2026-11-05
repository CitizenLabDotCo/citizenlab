# frozen_string_literal: true

# End-to-end cover for the deferred project-moderator assignment: a participatory-process `admin`
# (from the per-process `NN---users.csv`) becomes a Go Vocal `project_moderator` after the template is
# applied. Driven from synthetic rows (see {DecidimImporter::SampleData}) since a self-contained roles
# fixture would need a full matching project + user; the pieces have their own unit specs too.

require 'rails_helper'
require_relative '../../fixtures/sample_data'

RSpec.describe DecidimImporter::TemplateCreator do
  it 'assigns a participatory-process admin as a Go Vocal project moderator' do
    described_class.new(DecidimImporter::SampleData.all).import

    project = Project.where("title_multiloc->>'fr-FR' = ?", 'Budget participatif 2021').first
    expect(project).to be_present

    henri = User.find_by(unique_code: 'decidim-user-2')
    expect(henri.project_moderator?(project.id)).to be(true)
  end
end
