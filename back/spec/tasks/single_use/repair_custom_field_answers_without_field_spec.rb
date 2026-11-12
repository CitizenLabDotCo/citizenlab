# frozen_string_literal: true

require 'rails_helper'

# Rename to *_spec.ignore.rb once the task has been released and run, per
# lib/tasks/single_use/README.md.
# rubocop:disable RSpec/DescribeClass
describe 'single_use:repair_custom_field_answers_without_field' do
  subject(:run) { task.invoke }

  before { load_rake_tasks_if_not_loaded }

  # TenantScript writes its report to the working directory, so run in a throwaway one.
  around do |example|
    Dir.mktmpdir { |dir| Dir.chdir(dir) { example.run } }
  end

  after { task.reenable }

  let(:task) { Rake::Task['single_use:repair_custom_field_answers_without_field'] }
  let(:project) { create(:single_phase_ideation_project) }
  let(:form) { create(:custom_form, participation_context: project) }
  let(:idea) { create(:idea, project: project, phases: project.phases) }

  def answer_without_field(record, key, value: 'x')
    record.custom_field_answers.create!(key: key, value: value)
  end

  def form_field(project, key)
    form = CustomForm.find_by(participation_context: project) || create(:custom_form, participation_context: project)
    create(:custom_field_text, resource: form, key: key)
  end

  def log_move(idea, from:, at: Time.zone.now)
    create(:idea_changed_activity, item: idea, acted_at: at, payload: { change: { project_id: [from.id, idea.project_id] } })
  end

  describe 'an answer whose question is in the form of its record' do
    it 're-attaches the answer of an input' do
      field = create(:custom_field_text, resource: form, key: 'pet')
      answer = answer_without_field(idea, 'pet')

      run

      expect(answer.reload).to have_attributes(custom_field_id: field.id, value: 'x')
    end

    it 're-attaches an _other answer to its parent question' do
      field = create(:custom_field_text, resource: form, key: 'pet')
      answer = answer_without_field(idea, 'pet_other')

      run

      expect(answer.reload.custom_field_id).to eq field.id
    end

    it 're-attaches a u_ answer to the registration question' do
      field = create(:custom_field, key: 'pet')
      answer = answer_without_field(idea, 'u_pet')

      run

      expect(answer.reload.custom_field_id).to eq field.id
    end

    it 're-attaches the answer of a user' do
      field = create(:custom_field, key: 'pet')
      answer = answer_without_field(create(:user), 'pet')

      run

      expect(answer.reload.custom_field_id).to eq field.id
    end
  end

  describe 'an answer of an input that moved project' do
    let(:previous_project) { create(:single_phase_ideation_project) }

    it 're-attaches the answer to the question of a project the input was in' do
      field = form_field(previous_project, 'only_there')
      answer = answer_without_field(idea, 'only_there')
      log_move(idea, from: previous_project)

      run

      expect(answer.reload.custom_field_id).to eq field.id
    end

    it 'prefers the project the input left most recently' do
      earlier_project = create(:single_phase_ideation_project)
      form_field(earlier_project, 'only_there')
      field = form_field(previous_project, 'only_there')
      answer = answer_without_field(idea, 'only_there')
      log_move(idea, from: earlier_project, at: 2.days.ago)
      log_move(idea, from: previous_project, at: 1.day.ago)

      run

      expect(answer.reload.custom_field_id).to eq field.id
    end

    it 'deletes the answer when the question is in a project the input was never in' do
      form_field(previous_project, 'only_there')
      answer = answer_without_field(idea, 'only_there')

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end

    it 'deletes the answer of a survey response, which cannot have moved' do
      create(:idea_status_proposed)
      response = create(:native_survey_response)
      form_field(previous_project, 'only_there')
      answer = answer_without_field(response, 'only_there')
      log_move(response, from: previous_project)

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end
  end

  describe 'an answer whose question is nowhere' do
    it 'deletes the answer of an input' do
      form
      answer = answer_without_field(idea, 'gone')

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end

    it 'deletes the answer of a user' do
      answer = answer_without_field(create(:user), 'gone')

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end

    it 'deletes an answer whose record no longer exists' do
      answer = answer_without_field(idea, 'gone')
      answer.update_column(:answerable_id, SecureRandom.uuid)

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end
  end

  it 'deletes an answer whose value its question refuses, and reports why' do
    create(:custom_field_gender)
    answer = answer_without_field(create(:user), 'gender', value: 'not a gender')

    run

    expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    expect(File.read('repair_custom_field_answers_without_field.json')).to include('not re-attached')
  end

  it 'leaves answers that have a field alone' do
    field = create(:custom_field_text, resource: form, key: 'pet')
    answer = idea.custom_field_answers.create!(key: 'pet', value: 'cat', custom_field: field)

    expect { run }.not_to(change { answer.reload.attributes })
  end
end
# rubocop:enable RSpec/DescribeClass
