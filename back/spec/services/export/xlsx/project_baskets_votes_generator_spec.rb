# frozen_string_literal: true

require 'rails_helper'

describe Export::Xlsx::ProjectBasketsVotesGenerator do
  let(:service) { described_class.new }

  describe 'generate_project_baskets_votes_xlsx' do
    let(:phase1) { create(:single_voting_phase, title_multiloc: { en: 'Phase 1' }, start_at: Time.now - 18.days, end_at: Time.now - 17.days) }
    let(:phase2) { create(:multiple_voting_phase, title_multiloc: { en: 'Phase 2' }, start_at: Time.now - 14.days, end_at: Time.now - 13.days) }
    let(:phase3) { create(:budgeting_phase, title_multiloc: { en: 'Phase 3' }, start_at: Time.now - 10.days, end_at: Time.now - 9.days) }
    let(:project) { create(:project, phases: [phase1, phase2, phase3]) }
    let(:ideas) do
      %w[idea1 idea2 idea3 idea4].map { |t| create(:idea, project: project, budget: 500, title_multiloc: { en: t }) }
    end
    let(:user1) { create(:user) }
    let(:user2) { create(:user) }

    # Link all ideas to all voting phases
    let!(:ideas_phases) do
      [phase1, phase2, phase3].each do |phase|
        ideas.each { |idea| create(:ideas_phase, idea: idea, phase: phase) }
      end
    end

    # 2 users vote differently in single voting phase:
    let(:basket1) { create(:basket, user: user1, phase: phase1) }
    let(:basket2) { create(:basket, user: user2, phase: phase1) }
    let!(:baskets_idea1) { create(:baskets_idea, basket: basket1, idea: ideas[0], votes: 1) }
    let!(:baskets_idea2) { create(:baskets_idea, basket: basket2, idea: ideas[1], votes: 1) }

    # 1 user votes for 2 ideas in multiple voting phase:
    let(:basket3) { create(:basket, user: user1, phase: phase2) }
    let!(:baskets_idea3) { create(:baskets_idea, basket: basket3, idea: ideas[0], votes: 42) }
    let!(:baskets_idea4) { create(:baskets_idea, basket: basket3, idea: ideas[1], votes: 24) }

    # 2 users vote for 2 ideas each in budgeting phase:
    let(:basket4) { create(:basket, user: user1, phase: phase3) }
    let(:basket5) { create(:basket, user: user2, phase: phase3) }
    let!(:baskets_idea5) { create(:baskets_idea, basket: basket4, idea: ideas[0], votes: 100) }
    let!(:baskets_idea6) { create(:baskets_idea, basket: basket4, idea: ideas[2], votes: 200) }
    let!(:baskets_idea7) { create(:baskets_idea, basket: basket5, idea: ideas[1], votes: 300) }
    let!(:baskets_idea8) { create(:baskets_idea, basket: basket5, idea: ideas[2], votes: 400) }

    let(:xlsx) { service.generate_project_baskets_votes_xlsx(project) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a worksheet for each voting phase' do
      expect(workbook.worksheets.size).to eq(3)
      expect(workbook.worksheets.map(&:sheet_name)).to contain_exactly('Phase 1', 'Phase 2', 'Phase 3')
    end

    it 'handles phases same title multiloc values' do
      phase1.update!(title_multiloc: phase2.title_multiloc)
      expect(workbook.worksheets.map(&:sheet_name)).to contain_exactly('Phase 2 (1)', 'Phase 2 (2)', 'Phase 3')
    end

    it 'contains a row for every user who voted in each phase' do
      expect(workbook.worksheets[0].sheet_data.size).to eq(3) # Header row + 2 voters
      expect(workbook.worksheets[1].sheet_data.size).to eq(2) # Header row + 1 voter
      expect(workbook.worksheets[2].sheet_data.size).to eq(3) # Header row + 2 voters
    end

    it 'does not contain a row for a NOT submitted basket' do
      basket1.update!(submitted_at: nil) # user1 started allocating votes to ideas, but did not submit the vote selection
      expect(workbook.worksheets[0].sheet_data.size).to eq(2) # Header row + 1 voter
    end

    it 'contains one column for each idea in a phase, on each respective worksheet' do
      3.times do |i|
        header_row = workbook.worksheets[i][0].cells.map(&:value)
        expect(header_row).to contain_exactly('idea1', 'idea2', 'idea3', 'idea4', 'Submitted at')
      end
    end

    it 'contains a row with vote selection values for a user who voted in a phase + date submitted' do
      header_row = workbook.worksheets[1][0].cells.map(&:value)
      user_row = workbook.worksheets[1][1].cells.map(&:value)

      expect(user_row[header_row.find_index 'idea1']).to eq baskets_idea3.votes
      expect(user_row[header_row.find_index 'idea2']).to eq baskets_idea4.votes
      expect(user_row[header_row.find_index 'idea3']).to eq 0
      expect(user_row[header_row.find_index 'idea4']).to eq 0
      expect(user_row[header_row.find_index 'Submitted at'].to_i).to eq basket3.submitted_at.to_i
    end

    it 'handles ideas with same title multiloc values' do
      ideas[1].update!(title_multiloc: ideas[0].title_multiloc)
      header_row = workbook.worksheets[1][0].cells.map(&:value)
      user_row = workbook.worksheets[1][1].cells.map(&:value)

      expect(user_row[header_row.find_index 'idea1 (1)']).to eq baskets_idea3.votes
      expect(user_row[header_row.find_index 'idea1 (2)']).to eq baskets_idea4.votes
    end

    it 'contains extra columns for custom user fields' do
      create(:custom_field_domicile)
      area = create(:area, title_multiloc: { 'en' => 'Center' })
      user1.update!(custom_field_values: { 'domicile' => area.id })

      header_row = workbook.worksheets[1][0].cells.map(&:value)
      user_row = workbook.worksheets[1][1].cells.map(&:value)

      expect(user_row[header_row.find_index 'domicile']).to eq 'Center'
    end

    it 'includes hidden custom fields' do
      create(:custom_field, hidden: true, title_multiloc: { 'en' => 'Hidden field' })
      header_row = workbook.worksheets[1][0].cells.map(&:value)
      field_idx = header_row.find_index 'Hidden field'
      expect(field_idx).to be_present
    end
  end
end
