# frozen_string_literal: true

require 'rails_helper'
require_relative '../../fixtures/sample_data'

RSpec.describe DecidimImporter::TemplateCreator do
  let(:rows) do
    data = DecidimImporter::SampleData.all
    data[:folders] = [{ 'uid' => 'decidim-group-2', 'title' => '{"en":"","fr":""}' }]
    data[:projects] = data[:projects].map do |row|
      row.merge('private_space' => 'true', 'is_transparent' => 'false',
        'participatory_process_group' => 'decidim-group-2')
    end
    data
  end

  it 'imports a private space visible to its members only, inside an untitled folder' do
    described_class.new(rows).import

    project = Project.find_by!("title_multiloc->>'fr-FR' = ?", 'Budget participatif 2021')
    expect(project.visible_to).to eq('groups')
    expect(project.groups.sole.members).to contain_exactly(User.find_by!(unique_code: 'decidim-user-2'))
    expect(project.folder.title_multiloc['fr-FR']).to be_present
  end
end
