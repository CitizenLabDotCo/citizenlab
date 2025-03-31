require 'rails_helper'

describe 'migrate_custom_forms:separate_title_body_pages rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['migrate_custom_forms:separate_title_body_pages'].reenable }

  # Tests:
    # page-title-body-page -> page-title-page-body-page
    # page-title-body-page-extra-page -> page-title-page-body-page-extra-page
    # page-title-page-body-page -> page-title-page-body-page
  # page-body-title-page -> page-body-page-title-page
  # page-body-page-title-page -> page-body-page-title-page
  # page-extra-title-extra-body-extra-page -> page-extra-page-title-page-extra-page-body-page-extra-page
  # page-title-extra-body-extra-page -> page-title-page-extra-page-body-page-extra-page
  # page-extra-title-body-page -> page-extra-page-title-page-body-page
  {
    %i[title_page title body page] => %i[title_page title body_page body page],
    %i[title_page title body page extra page] => %i[title_page title body_page body page extra page],
    %i[title_page title page body page] => %i[title_page title body_page body page],
    %i[page body title page] => %i[body_page body title_page title page],
  }.each do |form_from, form_to|
    it "Migrates #{form_from} to #{form_to}" do
      form = create(:custom_form)
      form_from.each { |sym| create_field_before(sym, form) }

      Rake::Task['migrate_custom_forms:separate_title_body_pages'].invoke

      fields_after = form.reload.custom_fields
      expect(fields_after.size).to eq form_to.size
      fields_after.zip(form_to).each do |field_after, sym|
        case sym
        when :page
          expect(field_after.input_type).to eq 'page'
          expect(field_after.code).to be_nil
        when :title
          expect(field_after.input_type).to eq 'text_multiloc'
          expect(field_after.code).to eq 'title_multiloc'
        when :body
          expect(field_after.input_type).to eq 'html_multiloc'
          expect(field_after.code).to eq 'body_multiloc'
        when :title_page
          expect(field_after.input_type).to eq 'page'
          expect(field_after.code).to eq 'title_page'
        when :body_page
          expect(field_after.input_type).to eq 'page'
          expect(field_after.code).to eq 'body_page'
        end
      end
    end
  end

  # TODO: Test preservation of custom copy (title and description)
  # TODO: Test mapping of codes

  def create_field_before(sym, form)
    case sym
    when :page
      create(:custom_field_page, resource: form)
    when :title
      create(:custom_field, code: 'title_multiloc', input_type: 'text_multiloc', resource: form)
    when :body
      create(:custom_field, code: 'body_multiloc', input_type: 'html_multiloc', resource: form)
    when :extra
      create(:custom_field_number, resource: form)
    when :title_page
      create(:custom_field_page, resource: form).tap do |field|
        field.update_columns(code: 'ideation_page1')
      end
    else
      raise "Unknown field type: #{sym}"
    end
  end
end
