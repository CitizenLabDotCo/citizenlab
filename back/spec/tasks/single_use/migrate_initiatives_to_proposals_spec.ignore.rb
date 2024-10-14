require 'rails_helper'

describe 'initiatives_to_proposals:migrate_proposals rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['initiatives_to_proposals:migrate_proposals'].reenable }

  it 'updates the first name of default moderators to Go Vocal' do
    create(:initiative, initiative_status: create(:initiative_status, code: 'proposed', title_multiloc: { 'en' => 'proposed', 'da-DK' => 'uegnet' }))
    create(:proposals_status, code: 'proposed')

    Rake::Task['initiatives_to_proposals:migrate_proposals'].invoke

    expect(Idea.includes(:creation_phase).where(creation_phase: { participation_method: 'proposals' }).count).to eq(1)
    expect(IdeaStatus.find_by(participation_method: 'proposals', code: 'proposed').title_multiloc['da-DK']).to eq('uegnet')
  end
end
