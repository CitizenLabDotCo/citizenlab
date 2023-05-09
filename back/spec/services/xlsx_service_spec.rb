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

  describe 'generate_ideas_xlsx' do
    let(:ideas) do
      create_list(:idea, 5).tap do |ideas|
        ideas.first.author.destroy! # should be able to handle ideas without author
        ideas.first.reload
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
