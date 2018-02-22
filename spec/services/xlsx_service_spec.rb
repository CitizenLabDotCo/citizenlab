require "rails_helper"
require 'rubyXL'

describe XlsxService do
  let(:service) { XlsxService.new }

  describe "generate_users_xlsx" do

    let(:users) { create_list(:user, 5) }
    let(:xlsx) { service.generate_users_xlsx(users) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every user" do
      expect(worksheet.sheet_data.size).to eq (users.size + 1) 
    end

    it "contains extra columns for custom user fields" do
      custom_fields = create_list(:custom_fields, 3)
      expect(worksheet[0]).to include custom_fields.map(&:key)
    end

  end

  describe "generate_ideas_xlsx" do

    let(:ideas) { create_list(:idea, 5) }
    let(:xlsx) { service.generate_ideas_xlsx(ideas) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every idea" do
      expect(worksheet.sheet_data.size).to eq (ideas.size + 1) 
    end

  end

  describe "generate_comments_xlsx" do

    let(:comments) { create_list(:comment, 5) }
    let(:xlsx) { service.generate_comments_xlsx(comments) }
    let(:workbook) { RubyXL::Parser.parse_buffer(xlsx) }
    let(:worksheet) { workbook.worksheets[0] }

    it "exports a valid excel file" do
      expect{ workbook }.to_not raise_error
    end

    it "contains a row for every comment" do
      expect(worksheet.sheet_data.size).to eq (comments.size + 1) 
    end
  end

end
