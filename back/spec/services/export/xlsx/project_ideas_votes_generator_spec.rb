# frozen_string_literal: true

require 'rails_helper'

describe Export::Xlsx::ProjectIdeasVotesGenerator do
  let(:service) { described_class.new }

  describe 'generate_project_ideas_votes_xlsx' do
    let(:phase1) { create(:phase, title_multiloc: { en: 'Ideation phase' }, start_at: Time.now - 20.days, end_at: Time.now - 19.days) }
    let(:phase2) { create(:single_voting_phase, title_multiloc: { en: 'Single voting phase' }, start_at: Time.now - 18.days, end_at: Time.now - 17.days) }
    let(:phase3) { create(:multiple_voting_phase, title_multiloc: { en: 'Multiple voting phase' }, start_at: Time.now - 14.days, end_at: Time.now - 13.days) }
    let(:phase4) { create(:budgeting_phase, title_multiloc: { en: 'Budget allocation phase' }, start_at: Time.now - 10.days, end_at: Time.now - 9.days) }
    let(:project) { create(:project, phases: [phase1, phase2, phase3, phase4]) }
    let(:ideas) do
      %w[idea1 idea2 idea3 idea4].map { |t| create(:idea, project: project, budget: 500, title_multiloc: { en: t }) }
    end
    # Link ideas to all voting phases
    let!(:ideas_phases) do
      ideas.each { |idea| create(:ideas_phase, idea: idea, phase: phase4) }
    end
    let(:user1) { create(:user) }
    let(:user2) { create(:user) }

    # 2 users select ideas[0], and 1 user selects ideas[1], in single voting phase:
    let!(:ideas_phase1) { create(:ideas_phase, idea: ideas[0], phase: phase2, votes_count: 2) }
    let!(:ideas_phase2) { create(:ideas_phase, idea: ideas[1], phase: phase2, votes_count: 1) }
    let!(:ideas_phase3) { create(:ideas_phase, idea: ideas[2], phase: phase2, votes_count: 0) }
    let!(:ideas_phase4) { create(:ideas_phase, idea: ideas[3], phase: phase2, votes_count: 0) }

    # 1 user votes for ideas[0] && ideas[1], and 1 user votes for ideas[0], in multiple voting phase:
    let(:basket1) { create(:basket, user: user1, phase: phase3) }
    let!(:baskets_idea3) { create(:baskets_idea, basket: basket1, idea: ideas[0], votes: 42) }
    let!(:baskets_idea4) { create(:baskets_idea, basket: basket1, idea: ideas[1], votes: 24) }
    let(:basket2) { create(:basket, user: user2, phase: phase3) }
    let!(:baskets_idea5) { create(:baskets_idea, basket: basket2, idea: ideas[0], votes: 21) }
    let!(:ideas_phase5) { create(:ideas_phase, idea: ideas[0], phase: phase3, votes_count: 63) }
    let!(:ideas_phase6) { create(:ideas_phase, idea: ideas[1], phase: phase3, votes_count: 24) }
    let!(:ideas_phase7) { create(:ideas_phase, idea: ideas[2], phase: phase3, votes_count: 0) }
    let!(:ideas_phase8) { create(:ideas_phase, idea: ideas[3], phase: phase3, votes_count: 0) }

    # 1 user votes for ideas[0] && ideas[2], and 1 user votes for idea[1] && ideas[2], in budgeting phase:
    let(:basket3) { create(:basket, user: user1, phase: phase4) }
    let(:basket4) { create(:basket, user: user2, phase: phase4) }
    let!(:baskets_idea6) { create(:baskets_idea, basket: basket3, idea: ideas[0]) }
    let!(:baskets_idea7) { create(:baskets_idea, basket: basket3, idea: ideas[2]) }
    let!(:baskets_idea8) { create(:baskets_idea, basket: basket4, idea: ideas[1]) }
    let!(:baskets_idea9) { create(:baskets_idea, basket: basket4, idea: ideas[2]) }

    let(:xlsx) { service.generate_project_ideas_votes_xlsx(project) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a worksheet for each voting phase' do
      expect(workbook.worksheets.size).to eq(3)
      expect(workbook.worksheets.map(&:sheet_name))
        .to contain_exactly('Single voting phase', 'Multiple voting phase', 'Budget allocation phase')
    end

    it 'handles phases with same title multiloc values' do
      phase2.update!(title_multiloc: phase3.title_multiloc)
      expect(workbook.worksheets.map(&:sheet_name))
        .to contain_exactly('Multiple voting phase (1)', 'Multiple voting phase (2)', 'Budget allocation phase')
    end

    it 'contains a row for every idea assigned to the voting phase' do
      expect(workbook.worksheets[0].sheet_data.size).to eq(5) # Header row + 4 ideas assigned to phase2
      expect(workbook.worksheets[1].sheet_data.size).to eq(5) # Header row + 4 ideas assigned to phase3
      expect(workbook.worksheets[2].sheet_data.size).to eq(5) # Header row + 4 ideas assigned to phase4
    end

    it 'does not contain a row for an idea NOT assigned to a voting phase' do
      idea_not_in_voting_phase = create(:idea, project: project, phases: [phase1])
      idea_id_column = workbook.worksheets[0].collect { |row| row[0].value }

      expect(project.ideas.count).to eq(5)
      expect(idea_id_column).to contain_exactly('ID', ideas[0].id, ideas[1].id, ideas[2].id, ideas[3].id)
      expect(idea_id_column).not_to include(idea_not_in_voting_phase.id)
    end

    context 'when sheet is for a single voting phase' do
      it 'contains a column with vote count values for each idea in the phase' do
        votes_column = workbook.worksheets[0].collect { |row| { idea_id: row[0].value, votes: row[4].value } }
        expect(votes_column).to contain_exactly({ idea_id: 'ID', votes: 'Votes' }, { idea_id: ideas[0].id, votes: 2 }, { idea_id: ideas[1].id, votes: 1 }, { idea_id: ideas[2].id, votes: 0 }, { idea_id: ideas[3].id, votes: 0 })
      end
    end

    context 'when sheet is for a multiple voting phase' do
      it 'contains a column with count of participants who voted for each idea in the phase' do
        participants_column = workbook.worksheets[1].collect { |row| { idea_id: row[0].value, participants: row[4].value } }
        expect(participants_column).to contain_exactly({ idea_id: 'ID', participants: 'Participants' }, { idea_id: ideas[0].id, participants: 2 }, { idea_id: ideas[1].id, participants: 1 }, { idea_id: ideas[2].id, participants: 0 }, { idea_id: ideas[3].id, participants: 0 })
      end

      it 'contains a column with vote count values for each idea in the phase' do
        votes_column = workbook.worksheets[1].collect { |row| { idea_id: row[0].value, votes: row[5].value } }
        expect(votes_column).to contain_exactly({ idea_id: 'ID', votes: 'Votes' }, { idea_id: ideas[0].id, votes: 63 }, { idea_id: ideas[1].id, votes: 24 }, { idea_id: ideas[2].id, votes: 0 }, { idea_id: ideas[3].id, votes: 0 })
      end
    end

    context 'when sheet is for a budget allocation phase' do
      it 'contains a column with count of participants who selected each idea in the phase' do
        participants_column = workbook.worksheets[2].collect { |row| { idea_id: row[0].value, participants: row[4].value } }
        expect(participants_column).to contain_exactly({ idea_id: 'ID', participants: 'Picks / Participants' }, { idea_id: ideas[0].id, participants: 1 }, { idea_id: ideas[1].id, participants: 1 }, { idea_id: ideas[2].id, participants: 2 }, { idea_id: ideas[3].id, participants: 0 })
      end

      it 'contains a column with cost (budgeted cost) of each idea in the phase' do
        ideas[1].update!(budget: 42)
        participants_column = workbook.worksheets[2].collect { |row| { idea_id: row[0].value, cost: row[5].value } }
        expect(participants_column).to contain_exactly({ idea_id: 'ID', cost: 'Cost' }, { idea_id: ideas[0].id, cost: 500 }, { idea_id: ideas[1].id, cost: 42 }, { idea_id: ideas[2].id, cost: 500 }, { idea_id: ideas[3].id, cost: 500 })
      end
    end

    it 'contains attribute values specific to the idea detailed in a row' do
      author = create(:user)
      topic1 = create(:input_topic_nature)
      topic2 = create(:input_topic_sustainability)
      idea_file1 = create(:idea_file, idea: ideas[0])
      ideas[0].update!(
        author: author,
        input_topics: [topic1, topic2],
        location_point: 'POINT(1.234 5.678)',
        location_description: '489 Calista Coves',
        manual_votes_amount: 11
      )

      header_row = workbook.worksheets[0][0].cells.map(&:value)
      idea_row = workbook.worksheets[0].find { |row| row[0].value == ideas[0].id }.cells.map(&:value)

      expect(idea_row[header_row.find_index 'ID']).to eq ideas[0].id
      expect(idea_row[header_row.find_index 'Title']).to eq ideas[0].title_multiloc['en']
      expect(idea_row[header_row.find_index 'Description']).to eq Export::Xlsx::Utils.new.convert_to_text_long_lines(ideas[0].body_multiloc['en'])
      expect(idea_row[header_row.find_index 'URL']).to eq Frontend::UrlService.new.model_to_url(ideas[0])
      expect(idea_row[header_row.find_index 'Attachments'])
        .to match %r{\A/uploads/.+/idea_file/file/#{idea_file1.id}/#{idea_file1.name}\Z}
      expect(idea_row[header_row.find_index 'Tags'].split(','))
        .to contain_exactly(topic1.title_multiloc['en'], topic2.title_multiloc['en'])
      expect(idea_row[header_row.find_index 'Latitude']).to eq ideas[0].location_point.coordinates.last
      expect(idea_row[header_row.find_index 'Longitude']).to eq ideas[0].location_point.coordinates.first
      expect(idea_row[header_row.find_index 'Location']).to eq ideas[0].location_description
      expect(idea_row[header_row.find_index 'Project']).to eq ideas[0].project.title_multiloc['en']
      expect(idea_row[header_row.find_index 'Status']).to eq ideas[0].idea_status.title_multiloc['en']
      expect(idea_row[header_row.find_index 'Author name']).to eq "#{author.first_name} #{author.last_name}"
      expect(idea_row[header_row.find_index 'Author email']).to eq author.email
      expect(idea_row[header_row.find_index 'Author ID']).to eq author.id
      expect(idea_row[header_row.find_index 'Published at'].to_i).to eq ideas[0].published_at.to_i
      expect(idea_row[header_row.find_index 'Offline votes'].to_i).to eq 11
    end
  end
end
