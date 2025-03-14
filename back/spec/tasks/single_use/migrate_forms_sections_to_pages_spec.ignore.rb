require 'rails_helper'

describe 'migrate_custom_forms:sections_to_pages rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['migrate_custom_forms:sections_to_pages'].reenable }

  it 'keeps native survey forms unchanged' do
    phase = create(:native_survey_phase)
    phase.pmethod.create_default_form!
    fields_before = phase.custom_form.custom_fields
    ids_before = fields_before.map(&:id)
    keys_before = fields_before.map(&:key)

    Rake::Task['migrate_custom_forms:sections_to_pages'].invoke

    phase.reload
    fields_after = phase.custom_form.custom_fields
    expect(fields_after.map(&:id)).to eq ids_before
    expect(fields_after.map(&:key)).to eq keys_before
  end

  it 'changes sections to pages and adds the end page for ideation forms' do
    phase = create(:phase)
    form = create(:custom_form, participation_context: phase.project)
    section1 = create(:custom_field, resource: form, description_multiloc: { 'en' => 'Section 1 description' })
    section1.update_columns(input_type: 'section', code: 'ideation_section1')
    title = create(:custom_field, resource: form, input_type: 'text_multiloc', code: 'title_multiloc', key: 'title_multiloc')
    section2 = create(:custom_field, resource: form)
    section2.update_columns(input_type: 'section', code: 'ideation_section2')
    section3 = create(:custom_field, resource: form)
    section3.update_columns(input_type: 'section', code: 'ideation_section3')

    Rake::Task['migrate_custom_forms:sections_to_pages'].invoke

    form.reload
    expect(form.custom_fields.pluck(:id)).to match [section1.id, title.id, section2.id, section3.id, an_instance_of(String)]
    expect(form.custom_fields.pluck(:input_type)).to eq %w[page text_multiloc page page page]
    expect(form.custom_fields.pluck(:code)).to eq ['ideation_page1', 'title_multiloc', 'ideation_page2', 'ideation_page3', nil]
    expect(form.custom_fields.pluck(:key)).to match [an_instance_of(String), 'title_multiloc', an_instance_of(String), an_instance_of(String), 'form_end']
    expect(form.custom_fields.pluck(:description_multiloc)).to match [{ 'en' => 'Section 1 description' }, anything, anything, anything, anything]
    expect(form.custom_fields.pluck(:page_layout)).to eq ['default', nil, 'default', 'default', 'default']
  end

  it 'changes sections to pages and adds the end page for proposals forms' do
    phase = create(:proposals_phase)
    form = create(:custom_form, participation_context: phase)
    title = create(:custom_field, resource: form, input_type: 'text_multiloc', code: 'title_multiloc', key: 'title_multiloc')
    section1 = create(:custom_field, resource: form)
    section1.update_columns(input_type: 'section', code: 'ideation_section1')
    number = create(:custom_field_number, resource: form)

    Rake::Task['migrate_custom_forms:sections_to_pages'].invoke

    form.reload
    expect(form.custom_fields.pluck(:id)).to match [title.id, an_instance_of(String), number.id, an_instance_of(String)]
    expect(form.custom_fields.pluck(:input_type)).to eq %w[text_multiloc page number page]
    expect(form.custom_fields.pluck(:code)).to eq ['title_multiloc', 'ideation_page1', nil, nil]
    expect(form.custom_fields.pluck(:key)).to match ['title_multiloc', an_instance_of(String), an_instance_of(String), 'form_end']
    expect(form.custom_fields.pluck(:page_layout)).to eq [nil, 'default', nil, 'default']
  end
end
