# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::ImportIdeasService do
  let(:service) { described_class.new }

  before do
    create :idea_status, code: 'proposed'
  end

  it 'imports multiple ideas' do
    project1 = create :project, title_multiloc: { 'fr-BE' => 'Projet un', 'en' => 'Project 1' }
    project2 = create :project, title_multiloc: { 'nl-BE' => 'Project twee', 'en' => 'Project 2' }
    create :idea, project: project2
    user1 = create :user, email: 'userimport@citizenlab.co'
    user2 = create :user, email: 'userimport2@citizenlab.co'

    idea_rows = [
      {
        title_multiloc: { 'en' => 'My idea title' },
        body_multiloc: { 'en' => 'My idea description' },
        project_title: 'Project 1',
        user_email: 'userimport@citizenlab.co'
      },
      {
        title_multiloc: { 'en' => 'My idea title 2' },
        body_multiloc: { 'en' => 'My idea description 2' },
        project_title: 'Project 2',
        user_email: 'userimport2@citizenlab.co'
      }
    ]
    service.import_ideas idea_rows

    expect(project1.reload.ideas_count).to eq 1
    idea1 = user1.ideas.first
    expect(idea1.project_id).to eq project1.id
    expect(idea1.title_multiloc).to eq({ 'en' => 'My idea title' })
    expect(idea1.body_multiloc).to eq({ 'en' => 'My idea description' })

    expect(project2.reload.ideas_count).to eq 2
    idea2 = user2.ideas.first
    expect(idea2.project_id).to eq project2.id
    expect(idea2.title_multiloc).to eq({ 'en' => 'My idea title 2' })
    expect(idea2.body_multiloc).to eq({ 'en' => 'My idea description 2' })
  end
end
