require 'rails_helper'

describe 'migrate_custom_forms:separate_title_body_pages rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['migrate_custom_forms:separate_title_body_pages'].reenable }

  {
    %i[title_page title body end_page] => %i[title_page title body_page body end_page],
    %i[page title body end_page] => %i[title_page title body_page body end_page],
    %i[title_page title body page extra end_page] => %i[title_page title body_page body page extra end_page],
    %i[title_page title page body end_page] => %i[title_page title body_page body end_page],
    %i[title_page title body_page body end_page] => %i[title_page title body_page body end_page],
    %i[page title page body end_page] => %i[title_page title body_page body end_page],
    %i[title_page body title end_page] => %i[body_page body title_page title end_page],
    %i[page body title end_page] => %i[body_page body title_page title end_page],
    %i[page body title_page title end_page] => %i[body_page body title_page title end_page],
    %i[page body page title end_page] => %i[body_page body title_page title end_page],
    %i[title_page extra title extra body extra end_page] => %i[page extra title_page title page extra body_page body page extra end_page],
    %i[page extra extra title body extra extra end_page] => %i[page extra extra title_page title body_page body page extra extra end_page],
    %i[title_page title extra extra body end_page] => %i[title_page title page extra extra body_page body end_page],
    %i[title_page body extra title extra end_page] => %i[body_page body page extra title_page title page extra end_page],
    %i[title_page extra body extra title extra end_page] => %i[page extra body_page body page extra title_page title page extra end_page],
    %i[title_page extra title body end_page] => %i[page extra title_page title body_page body end_page],
    %i[title_page title body disabled page extra end_page] => %i[title_page title body_page body page extra disabled end_page],
    %i[title_page title body disabled end_page] => %i[title_page title body_page body disabled end_page],
    %i[page body extra disabled page title disabled end_page] => %i[body_page body page extra title_page title disabled disabled end_page],
    %i[page body extra disabled page title extra disabled end_page] => %i[body_page body page extra title_page title page extra disabled disabled end_page]
  }.each do |form_from, form_to|
    it "Migrates #{form_from} to #{form_to}" do
      form = create(:custom_form)
      form_from.each { |sym| create_field_before(sym, form) }

      Rake::Task['migrate_custom_forms:separate_title_body_pages'].invoke

      fields_after = form.reload.custom_fields
      json = JSON.parse(File.read('migrate_forms_separate_title_description_pages_report.json'))
      expect(json['errors']).to be_blank
      expect(fields_after.size).to eq form_to.size
      fields_after.zip(form_to).each do |field_after, sym|
        case sym
        when :page
          expect(field_after.input_type).to eq 'page'
          expect(field_after.code).to be_nil
        when :end_page
          expect(field_after.input_type).to eq 'page'
          expect(field_after.code).to be_nil
          expect(field_after.key).to eq 'form_end'
        when :title
          expect(field_after.input_type).to eq 'text_multiloc'
          expect(field_after.code).to eq 'title_multiloc'
        when :body
          expect(field_after.input_type).to eq 'html_multiloc'
          expect(field_after.code).to eq 'body_multiloc'
        when :extra
          expect(field_after.input_type).to eq 'number'
          expect(field_after.code).to be_nil
        when :title_page
          expect(field_after.input_type).to eq 'page'
          expect(field_after.code).to eq 'title_page'
        when :body_page
          expect(field_after.input_type).to eq 'page'
          expect(field_after.code).to eq 'body_page'
        when :disabled
          expect(field_after.enabled).to be false
        end
      end
    end
  end

  it 'Maps the old default page codes to the new ones' do
    form = create(:custom_form)
    %w[ideation_page2 ideation_page1 ideation_page3].each do |code|
      create(:custom_field_page, resource: form).tap do |field|
        field.update_columns(code: code)
      end
    end

    Rake::Task['migrate_custom_forms:separate_title_body_pages'].invoke

    expect(form.reload.custom_fields.pluck(:code)).to eq %w[uploads_page title_page details_page]
  end

  it 'Preserves custom copy of pages in the migrated form' do
    form1 = create(:custom_form) # title_page title page body page
    create_field_before(:title_page, form1).update_columns(
      title_multiloc: { 'en' => 'Custom title page title' },
      description_multiloc: { 'en' => 'Custom title page description' }
    )
    create_field_before(:title, form1)
    create_field_before(:page, form1).update!(
      title_multiloc: { 'en' => 'Custom body page title' },
      description_multiloc: { 'en' => 'Custom body page description' }
    )
    create_field_before(:body, form1)
    create_field_before(:page, form1).update!(
      title_multiloc: { 'en' => 'Custom end page title' },
      description_multiloc: { 'en' => 'Custom end page description' }
    )

    form2 = create(:custom_form) # page title body extra page
    create_field_before(:page, form2).update_columns(
      title_multiloc: { 'en' => 'Custom first page title' },
      description_multiloc: { 'en' => 'Custom first page description' }
    )
    create_field_before(:title, form2)
    create_field_before(:body, form2)
    create_field_before(:extra, form2)
    create_field_before(:page, form2).update!(
      title_multiloc: { 'en' => 'Custom end page title' },
      description_multiloc: { 'en' => 'Custom end page description' }
    )

    form3 = create(:custom_form) # title_page extra title body page
    create_field_before(:title_page, form3).update_columns(
      title_multiloc: { 'en' => 'Custom title page title' },
      description_multiloc: { 'en' => 'Custom title page description' }
    )
    create_field_before(:extra, form3)
    create_field_before(:title, form3)
    create_field_before(:body, form3)
    create_field_before(:page, form3).update!(
      title_multiloc: { 'en' => 'Custom end page title' },
      description_multiloc: { 'en' => 'Custom end page description' }
    )

    form4 = create(:custom_form) # page extra title body page
    create_field_before(:page, form4).update_columns(
      title_multiloc: { 'en' => 'Custom first page title' },
      description_multiloc: { 'en' => 'Custom first page description' }
    )
    create_field_before(:extra, form4)
    create_field_before(:title, form4)
    create_field_before(:body, form4)
    create_field_before(:page, form4).update!(
      title_multiloc: { 'en' => 'Custom end page title' },
      description_multiloc: { 'en' => 'Custom end page description' }
    )

    Rake::Task['migrate_custom_forms:separate_title_body_pages'].invoke

    expect(form1.reload.custom_fields.pluck(:code)).to eq ['title_page', 'title_multiloc', 'body_page', 'body_multiloc', nil]
    expect(form1.custom_fields.map(&:title_multiloc)).to match [
      hash_including('en' => 'What is your idea?'),
      anything,
      { 'en' => 'Custom body page title' },
      anything,
      { 'en' => 'Custom end page title' }
    ]
    expect(form1.custom_fields.map(&:description_multiloc)).to match [
      { 'en' => 'Custom title page description' },
      anything,
      { 'en' => 'Custom body page description' },
      anything,
      { 'en' => 'Custom end page description' }
    ]

    expect(form2.reload.custom_fields.pluck(:code)).to eq ['title_page', 'title_multiloc', 'body_page', 'body_multiloc', nil, nil, nil]
    expect(form2.custom_fields.map(&:title_multiloc)).to match [
      hash_including('en' => 'What is your idea?'),
      anything,
      hash_including('en' => 'Tell us more'),
      anything,
      anything,
      anything,
      { 'en' => 'Custom end page title' }
    ]
    expect(form2.custom_fields.map(&:description_multiloc)).to match [
      { 'en' => 'Custom first page description' },
      anything,
      {},
      anything,
      anything,
      anything,
      { 'en' => 'Custom end page description' }
    ]

    expect(form3.reload.custom_fields.pluck(:code)).to eq [nil, nil, 'title_page', 'title_multiloc', 'body_page', 'body_multiloc', nil]
    expect(form3.custom_fields.map(&:title_multiloc)).to match [
      anything,
      anything,
      hash_including('en' => 'What is your idea?'),
      anything,
      hash_including('en' => 'Tell us more'),
      anything,
      { 'en' => 'Custom end page title' }
    ]
    expect(form3.custom_fields.map(&:description_multiloc)).to match [
      anything,
      anything,
      { 'en' => 'Custom title page description' },
      anything,
      {},
      anything,
      { 'en' => 'Custom end page description' }
    ]

    expect(form4.reload.custom_fields.pluck(:code)).to eq [nil, nil, 'title_page', 'title_multiloc', 'body_page', 'body_multiloc', nil]
    expect(form4.custom_fields.map(&:title_multiloc)).to match [
      { 'en' => 'Custom first page title' },
      anything,
      hash_including('en' => 'What is your idea?'),
      anything,
      hash_including('en' => 'Tell us more'),
      anything,
      { 'en' => 'Custom end page title' }
    ]
    expect(form4.custom_fields.map(&:description_multiloc)).to match [
      { 'en' => 'Custom first page description' },
      anything,
      anything,
      anything,
      {},
      anything,
      { 'en' => 'Custom end page description' }
    ]
  end

  def create_field_before(sym, form)
    case sym
    when :page
      create(:custom_field_page, resource: form)
    when :end_page
      create(:custom_field_form_end_page, resource: form)
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
    when :body_page
      create(:custom_field_page, code: 'body_page', resource: form)
    when :disabled
      create(:custom_field_number, resource: form, enabled: false)
    else
      raise "Unknown field type: #{sym}"
    end
  end
end
