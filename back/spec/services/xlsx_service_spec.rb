# frozen_string_literal: true

require 'rails_helper'
require 'rubyXL'

describe XlsxService do
  let(:service) { described_class.new }

  def xlsx_to_array(xlsx, sheet_index: 0)
    workbook = RubyXL::Parser.parse_buffer(xlsx)
    worksheet = workbook[sheet_index]
    worksheet.map { |row| row.cells.map(&:value) }
  end

  describe 'generate_users_xlsx' do
    let(:users) { create_list(:user, 5) }
    let(:xlsx) { service.generate_users_xlsx(users, view_private_attributes: true) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every user' do
      expect(worksheet.sheet_data.size).to eq(users.size + 1)
    end

    it 'contains extra columns for custom user fields' do
      create(:custom_field_domicile)
      custom_select = create(:custom_field_select, title_multiloc: { 'en' => 'Select' })
      custom_multiselect = create(:custom_field_multiselect, title_multiloc: { 'en' => 'Multiselect' })
      select_option = create(:custom_field_option, custom_field: custom_select, title_multiloc: { 'en' => 'Option 1' })
      multiselect_option = create(:custom_field_option, custom_field: custom_multiselect, title_multiloc: { 'en' => 'Option 2' })
      area = create(:area, title_multiloc: { 'en' => 'Center' })
      users.first.update!(
        custom_field_values: {
          'domicile' => area.id,
          custom_select.key => select_option.key,
          custom_multiselect.key => [multiselect_option.key]
        }
      )

      custom_fields_headers = %w[domicile Select Multiselect]
      title_row = worksheet[0].cells.map(&:value)
      expect(title_row).to include(*custom_fields_headers)

      domicile_index = title_row.find_index 'domicile'
      select_index = title_row.find_index 'Select'
      multiselect_index = title_row.find_index 'Multiselect'
      expect([domicile_index, select_index, multiselect_index]).to all(be_present)
      user_rows = worksheet.map do |row|
        row.cells.map(&:value)
      end
      user_row = user_rows.find do |values|
        values.include? users.first.id
      end
      expect(
        [user_row[domicile_index], user_row[select_index], user_row[multiselect_index]]
      ).to eq ['Center', 'Option 1', 'Option 2']
    end

    it 'includes hidden custom fields' do
      create(:custom_field, hidden: true, title_multiloc: { 'en' => 'Hidden field' })
      headers = worksheet[0].cells.map(&:value)
      field_idx = headers.find_index 'Hidden field'
      expect(field_idx).to be_present
    end

    it 'handles duplicate user custom field titles' do
      select1 = create(:custom_field_select, title_multiloc: { 'en' => 'gender' })
      select2 = create(:custom_field_select, title_multiloc: { 'en' => 'gender' })
      option1 = create(:custom_field_option, custom_field: select1, title_multiloc: { 'en' => 'Option 1' })
      option2 = create(:custom_field_option, custom_field: select2, title_multiloc: { 'en' => 'Option 2' })

      users.first.update!(
        custom_field_values: {
          select1.key => option1.key,
          select2.key => option2.key
        }
      )

      title_row = worksheet[0].cells.map(&:value)
      expect(title_row).to include('gender (1)', 'gender (2)')
      expect(title_row).not_to include('gender')

      column1 = title_row.find_index 'gender (1)'
      column2 = title_row.find_index 'gender (2)'
      user_rows = worksheet.map { |row| row.cells.map(&:value) }
      user_row = user_rows.find { |values| values.include? users.first.id }
      expect([user_row[column1], user_row[column2]]).to eq ['Option 1', 'Option 2']
    end

    describe do
      let(:xlsx) { service.generate_users_xlsx(users, view_private_attributes: false) }

      it 'hides private attributes' do
        custom_field = create(:custom_field, enabled: false)
        expect(worksheet[0].cells.map(&:value)).not_to include 'id'
        expect(worksheet[0].cells.map(&:value)).not_to include 'email'
        expect(worksheet[0].cells.map(&:value)).not_to include 'first_name'
        expect(worksheet[0].cells.map(&:value)).not_to include 'last_name'
        expect(worksheet[0].cells.map(&:value)).to include custom_field.title_multiloc['en']
      end
    end
  end

  describe 'generate_attendees_xlsx' do
    let(:users) { create_list(:user, 5) }
    let(:xlsx) { service.generate_attendees_xlsx(users, view_private_attributes: true) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every user' do
      expect(worksheet.sheet_data.size).to eq(users.size + 1)
    end

    it 'contains extra columns for custom user fields' do
      create(:custom_field_domicile)
      area = create(:area, title_multiloc: { 'en' => 'Center' })
      users.first.update(custom_field_values: { 'domicile' => area.id })

      title_row = worksheet[0].cells.map(&:value)
      user_rows = worksheet.map { |row| row.cells.map(&:value) }
      user_row = user_rows.find { |values| values.include? users.first.email }
      expect([user_row[title_row.find_index 'domicile']]).to eq ['Center']
    end

    it 'includes hidden custom fields' do
      create(:custom_field, hidden: true, title_multiloc: { 'en' => 'Hidden field' })
      headers = worksheet[0].cells.map(&:value)
      field_idx = headers.find_index 'Hidden field'
      expect(field_idx).to be_present
    end
  end

  describe 'generate_ideas_xlsx' do
    let(:ideas) do
      create_list(:idea, 5).tap do |ideas|
        ideas.first.author.destroy! # should be able to handle ideas without author
        ideas.first.reload
        ideas.last.update!(anonymous: true) # should be able to handle anonymous authors
        ideas.last.reload
      end
    end
    let(:xlsx) { service.generate_ideas_xlsx(ideas, view_private_attributes: true) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every idea' do
      expect(worksheet.sheet_data.size).to eq(ideas.size + 1)
    end

    it 'contains "Anonymous" as the author name for anonymously posted ideas' do
      I18n.load_path += Dir[Rails.root.join('spec/fixtures/locales/*.yml')]
      expect(worksheet[5].cells.map(&:value)[3]).to eq('Anonymous')
    end

    describe do
      let(:xlsx) { service.generate_ideas_xlsx(ideas, view_private_attributes: false) }

      it 'hides private attributes' do
        custom_field = create(:custom_field, enabled: false)
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_name'
        expect(worksheet[0].cells.map(&:value)).not_to include 'assignee'
        expect(worksheet[0].cells.map(&:value)).not_to include 'assignee_email'
        expect(worksheet[0].cells.map(&:value)).to include custom_field.title_multiloc['en']
      end
    end
  end

  describe 'generate_initiatives_xlsx' do
    let(:initiatives) { create_list(:initiative, 2) }
    let(:xlsx) { service.generate_initiatives_xlsx(initiatives) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every initiative' do
      expect(worksheet.sheet_data.size).to eq(initiatives.size + 1)
    end

    describe do
      let(:xlsx) { service.generate_initiatives_xlsx(initiatives, view_private_attributes: false) }

      it 'hides private attributes' do
        custom_field = create(:custom_field, enabled: false)
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_id'
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
        expect(worksheet[0].cells.map(&:value)).not_to include 'assignee_email'
        expect(worksheet[0].cells.map(&:value)).to include custom_field.title_multiloc['en']
      end
    end
  end

  describe 'generate_idea_comments_xlsx' do
    let(:comments) { create_list(:comment, 5, post: create(:idea)) }
    let(:xlsx) { service.generate_idea_comments_xlsx(comments) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every comment' do
      expect(worksheet.sheet_data.size).to eq(comments.size + 1)
      expect(worksheet[comments.size].cells.map(&:value)[worksheet[0].cells.map(&:value).index('project')]).to eq comments.last.idea.project.title_multiloc.values.first
    end

    describe do
      let(:xlsx) { service.generate_idea_comments_xlsx(comments, view_private_attributes: false) }

      it 'hides private attributes' do
        custom_field = create(:custom_field, enabled: false)
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_id'
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_name'
        expect(worksheet[0].cells.map(&:value)).to include custom_field.title_multiloc['en']
      end
    end
  end

  describe 'generate_initiative_comments_xlsx' do
    let(:comments) { create_list(:comment, 5, post: create(:initiative)) }
    let(:xlsx) { service.generate_initiative_comments_xlsx(comments) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file and contains a row for every comment' do
      expect { workbook }.not_to raise_error
      expect(worksheet.sheet_data.size).to eq(comments.size + 1)
      expect(worksheet[comments.size].cells.map(&:value)[worksheet[0].cells.map(&:value).index('parent_comment_id')]).to eq comments.last.parent_id
    end

    describe do
      let(:xlsx) { service.generate_initiative_comments_xlsx(comments, view_private_attributes: false) }

      it 'hides private attributes' do
        custom_field = create(:custom_field, enabled: false)
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_id'
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_name'
        expect(worksheet[0].cells.map(&:value)).to include custom_field.title_multiloc['en']
      end
    end
  end

  describe 'generate_invites_xlsx' do
    let(:invites) { create_list(:invite, 2) }
    let(:xlsx) { service.generate_invites_xlsx(invites) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a row for every invite' do
      expect(worksheet.sheet_data.size).to eq(invites.size + 1)
    end

    describe do
      let(:xlsx) { service.generate_invites_xlsx(invites, view_private_attributes: false) }

      it 'hides private attributes' do
        expect(worksheet[0].cells.map(&:value)).not_to include 'email'
      end
    end
  end

  describe 'generate_project_voting_xlsx' do
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

    let(:xlsx) { service.generate_project_voting_xlsx(project) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }

    it 'exports a valid excel file' do
      expect { workbook }.not_to raise_error
    end

    it 'contains a worksheet for each voting phase' do
      expect(workbook.worksheets.size).to eq(3)
      expect(workbook.worksheets.map(&:sheet_name)).to match_array(['Phase 1', 'Phase 2', 'Phase 3'])
    end

    it 'handles phases same title multiloc values' do
      phase1.update(title_multiloc: phase2.title_multiloc)
      expect(workbook.worksheets.map(&:sheet_name)).to match_array(['Phase 2 (1)', 'Phase 2 (2)', 'Phase 3'])
    end

    it 'contains a row for every user who voted in each phase' do
      expect(workbook.worksheets[0].sheet_data.size).to eq(3) # Header row + 2 voters
      expect(workbook.worksheets[1].sheet_data.size).to eq(2) # Header row + 1 voter
      expect(workbook.worksheets[2].sheet_data.size).to eq(3) # Header row + 2 voters
    end

    it 'contains one column for each idea in a phase, on each respective worksheet' do
      3.times do |i|
        header_row = workbook.worksheets[i][0].cells.map(&:value)
        expect(header_row).to match_array(['idea1', 'idea2', 'idea3', 'idea4', 'Date vote submitted'])
      end
    end

    it 'contains a row with vote selection values for a user who voted in a phase' do
      header_row = workbook.worksheets[1][0].cells.map(&:value)
      user_row = workbook.worksheets[1][1].cells.map(&:value)

      expect(user_row[header_row.find_index 'idea1']).to eq 42
      expect(user_row[header_row.find_index 'idea2']).to eq 24
      expect(user_row[header_row.find_index 'idea3']).to eq 0
      expect(user_row[header_row.find_index 'idea4']).to eq 0
    end

    it 'shows the date each vote basket was submitted (or nil if not submitted)' do
      basket1.update(submitted_at: nil) # user1 started allocating votes to ideas, but did not submit the vote selection
      header_row = workbook.worksheets[0][0].cells.map(&:value)
      user_row1 = workbook.worksheets[0][1].cells.map(&:value)
      user_row2 = workbook.worksheets[0][2].cells.map(&:value)

      expect([
        user_row1[header_row.find_index 'Date vote submitted'].to_i,
        user_row2[header_row.find_index 'Date vote submitted'].to_i
      ]).to match_array [0, basket2.submitted_at.to_i]
    end

    it 'handles ideas with same title multiloc values' do
      ideas[1].update(title_multiloc: ideas[0].title_multiloc)
      header_row = workbook.worksheets[1][0].cells.map(&:value)
      user_row = workbook.worksheets[1][1].cells.map(&:value)

      expect(user_row[header_row.find_index 'idea1 (1)']).to eq 42
      expect(user_row[header_row.find_index 'idea1 (2)']).to eq 24
    end

    it 'contains extra columns for custom user fields' do
      create(:custom_field_domicile)
      area = create(:area, title_multiloc: { 'en' => 'Center' })
      user1.update(custom_field_values: { 'domicile' => area.id })

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

  describe 'hash_to_xlsx' do
    let(:hash_array) do
      [
        { 'a' => 1, 'b' => 'two' },
        { 'a' => 2, 'b' => 'three', 'c' => 'fiesta' },
        { 'b' => 'four', 'c' => 'party' },
        { 'f' => 'fête' },
        {}
      ]
    end
    let(:xlsx) { service.hash_array_to_xlsx(hash_array) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it 'correctly converts a hash array to a xlsx stream' do
      expect(worksheet[0].cells.map(&:value)).to match %w[a b c f]
      expect(worksheet[2].cells.map(&:value)).to match [2, 'three', 'fiesta', nil]
    end
  end

  describe 'xlsx_to_hash_array' do
    let(:hash_array) do
      [
        { 'a' => 1, 'b' => 'two' },
        { 'a' => 2, 'b' => 'three', 'c' => 'fiesta' },
        { 'b' => 'four', 'c' => 'party' },
        { 'f' => 'fête' },
        {}
      ]
    end

    let(:xlsx) { service.hash_array_to_xlsx(hash_array) }
    let(:round_trip_hash_array) { service.xlsx_to_hash_array(xlsx) }

    it 'correctly converts an xlsx to a hash array' do
      expect(round_trip_hash_array).to eq hash_array
    end
  end

  describe '#xlsx_from_rows' do
    let(:rows) do
      [
        %w[col1 col2],
        ['a', 1],
        ['b', 0]
      ]
    end

    it 'converts a list of rows to an xlsx stream' do
      xlsx = service.xlsx_from_rows(rows)
      parsed_rows = xlsx_to_array(xlsx)
      expect(rows).to eq(parsed_rows)
    end
  end

  describe '#xlsx_from_columns' do
    let(:columns) do
      {
        col1: %w[a b],
        col2: [1, 0]
      }
    end

    let(:expected_rows) do
      [
        %w[col1 col2],
        ['a', 1],
        ['b', 0]
      ]
    end

    it 'converts a list of columns to an xlsx stream' do
      xlsx = service.xlsx_from_columns(columns)
      parsed_rows = xlsx_to_array(xlsx)
      expect(expected_rows).to eq(parsed_rows)
    end
  end
end
