require "rails_helper"
require 'rubyXL'


describe XlsxService do
  let(:service) { XlsxService.new }

  describe "escape_formula" do
    it "retains normal text" do
      text = '1 + 2 = 3'
      expect(service.escape_formula(text)).to eq text
    end

    it "escapes formula injections" do
      text = "=cmd|' /C notepad'!'A1'"
      expect(service.escape_formula(text)).not_to eq text
    end
  end

  describe "generate_users_xlsx" do
    let(:users) { create_list(:user, 5) }
    let(:xlsx) { service.generate_users_xlsx(users, view_private_attributes: true) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every user" do
      expect(worksheet.sheet_data.size).to eq (users.size + 1)
    end

    it "contains extra columns for custom user fields" do
      custom_fields = create_list(:custom_field, 2)
      custom_select = create(:custom_field_select)
      custom_multiselect = create(:custom_field_multiselect)
      custom_options = create_list(:custom_field_option, 2, custom_field: custom_select)
      custom_options_multi = create_list(:custom_field_option, 2, custom_field: custom_multiselect)
      users[0].custom_field_values[custom_select.key] = custom_options[0].key
      users[0].custom_field_values[custom_multiselect.key] = custom_options_multi[0].key

      custom_fields_headers = (custom_fields | [custom_select]).map do |custom_field|
        custom_field.title_multiloc["en"]
      end
      title_row = worksheet[0].cells.map(&:value)
      # works because the custom_field_select facory gives it a disting name from other fields
      select_col_index = title_row.find_index(custom_select.title_multiloc['en'])
      options_col = worksheet.map {|col| col.cells[select_col_index].value}

    	expect(title_row).to include(*custom_fields_headers)
    	expect(options_col).to include(custom_options[0].title_multiloc['en'])
    end

    describe do
      let(:xlsx) { service.generate_users_xlsx(users, view_private_attributes: false) }

      it "hides private attributes" do
        custom_field = create(:custom_field)
        expect(worksheet[0].cells.map(&:value)).not_to include 'email'
        expect(worksheet[0].cells.map(&:value)).not_to include 'birthyear'
        expect(worksheet[0].cells.map(&:value)).not_to include custom_field.title_multiloc["en"]
      end
    end
  end

  describe "generate_ideas_xlsx" do

    before { create_list(:custom_field, 2) }

    let(:ideas) do
      create_list(:idea, 5).tap do |ideas|
        ideas.first.author.destroy! # should be able to handle ideas without author
        ideas.first.reload
      end
    end
    let(:xlsx) { service.generate_ideas_xlsx(ideas, view_private_attributes: true) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every idea" do
      expect(worksheet.sheet_data.size).to eq (ideas.size + 1)
    end

    describe do
      let(:xlsx) { service.generate_ideas_xlsx(ideas, view_private_attributes: false) }

      it "hides private attributes" do
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
      end
    end
  end

  describe "generate_initiatives_xlsx" do
    let(:initiatives) { create_list(:initiative, 2) }
    let(:xlsx) { service.generate_initiatives_xlsx(initiatives) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every initiative" do
      expect(worksheet.sheet_data.size).to eq (initiatives.size + 1)
    end

    describe do
      let(:xlsx) { service.generate_initiatives_xlsx(initiatives, view_private_attributes: false) }

      it "hides private attributes" do
        expect(worksheet[0].cells.map(&:value)).not_to include 'assignee_email'
      end
    end
  end

  describe "generate_idea_comments_xlsx" do

    let(:comments) { create_list(:comment, 5, post: create(:idea)) }
    let(:xlsx) { service.generate_idea_comments_xlsx(comments) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every comment" do
      expect(worksheet.sheet_data.size).to eq (comments.size + 1)
      expect(worksheet[comments.size].cells.map(&:value)[worksheet[0].cells.map(&:value).index('project')]).to eq comments.last.idea.project.title_multiloc.values.first
    end

    describe do
      let(:xlsx) { service.generate_idea_comments_xlsx(comments, view_private_attributes: false) }

      it "hides private attributes" do
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
      end
    end
  end

  describe "generate_initiative_comments_xlsx" do

    let(:comments) { create_list(:comment, 5, post: create(:initiative)) }
    let(:xlsx) { service.generate_initiative_comments_xlsx(comments) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file and contains a row for every comment" do
      expect{ workbook }.to_not raise_error
      expect(worksheet.sheet_data.size).to eq (comments.size + 1)
      expect(worksheet[comments.size].cells.map(&:value)[worksheet[0].cells.map(&:value).index('parent_comment_id')]).to eq comments.last.parent_id
    end

    describe do
      let(:xlsx) { service.generate_initiative_comments_xlsx(comments, view_private_attributes: false) }

      it "hides private attributes" do
        expect(worksheet[0].cells.map(&:value)).not_to include 'author_email'
      end
    end
  end

  describe "generate_invites_xlsx" do
    let(:invites) { create_list(:invite, 2) }
    let(:xlsx) { service.generate_invites_xlsx(invites) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every invite" do
      expect(worksheet.sheet_data.size).to eq (invites.size + 1)
    end

    describe do
      let(:xlsx) { service.generate_invites_xlsx(invites, view_private_attributes: false) }

      it "hides private attributes" do
        expect(worksheet[0].cells.map(&:value)).not_to include 'email'
      end
    end
  end

  describe "hash_to_xlsx" do

    let(:hash_array) {[
      {"a" => 1, "b" => "two"},
      {"a" => 2, "b" => "three", "c" => "fiesta"},
      {"b" => "four", "c" => "party"},
      {"f" => 'fête'},
      {},
    ]}
    let(:xlsx) { service.hash_array_to_xlsx(hash_array) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "correctly converts a hash array to a xlsx stream" do
       expect(worksheet[0].cells.map(&:value)).to match ['a', 'b', 'c', 'f']
       expect(worksheet[2].cells.map(&:value)).to match [2, "three", "fiesta", nil]
    end
  end


  describe "xlsx_to_hash_array" do

    let(:hash_array) {[
      {"a" => 1, "b" => "two"},
      {"a" => 2, "b" => "three", "c" => "fiesta"},
      {"b" => "four", "c" => "party"},
      {"f" => 'fête'},
      {}
    ]}

    let(:xlsx) { service.hash_array_to_xlsx(hash_array) }
    let(:round_trip_hash_array) { service.xlsx_to_hash_array(xlsx) }

    it "correctly converts an xlsx to a hash array" do
       expect(round_trip_hash_array).to eq hash_array
    end
  end

  describe "sanitize_sheetname" do
    let(:sheetname) { 'With illegal characters \/*?:[]' }

    it "removes illegal characters" do
      expect(service.send(:sanitize_sheetname, sheetname)).to eq('With illegal characters ')
    end
  end
end
