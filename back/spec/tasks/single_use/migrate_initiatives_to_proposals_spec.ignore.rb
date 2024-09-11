require 'rails_helper'

describe 'migrate_proposals:initiatives_to_proposals rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['migrate_proposals:initiatives_to_proposals'].reenable }

  it 'updates the first name of default moderators to Go Vocal' do
    create(:initiative)

    Rake::Task['migrate_proposals:initiatives_to_proposals'].invoke

    expect(Proposal.count).to eq(1)
  end
end
