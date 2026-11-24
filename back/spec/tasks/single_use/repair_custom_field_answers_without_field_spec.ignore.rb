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
  let(:project) { create(:single_phase_ideation_project, created_at: 3.days.ago) }
  let(:idea) { create(:idea, project: project, phases: project.phases, created_at: 2.days.ago) }

  def answer_without_field(record, key, value: 'x')
    record.custom_field_answers.create!(key: key, value: value)
  end

  def project_with_question(key, created_at:)
    project = create(:single_phase_ideation_project, created_at: created_at)
    create(:custom_field_text, resource: create(:custom_form, participation_context: project), key: key)
  end

  def log_move(idea, from:)
    create(:idea_changed_activity, item: idea, payload: { change: { project_id: [from.id, idea.project_id] } })
  end

  describe 'an answer of an input that moved project' do
    it 're-attaches the answer when the input is older than its project' do
      field = project_with_question('only_there', created_at: 3.days.ago)
      project.update!(created_at: 1.day.ago)
      answer = answer_without_field(idea, 'only_there')

      run

      expect(answer.reload).to have_attributes(custom_field_id: field.id, value: 'x')
    end

    it 're-attaches the answer when the move is logged' do
      field = project_with_question('only_there', created_at: 3.days.ago)
      answer = answer_without_field(idea, 'only_there')
      log_move(idea, from: field.resource.participation_context)

      run

      expect(answer.reload.custom_field_id).to eq field.id
    end

    it 're-attaches an _other answer to its parent question' do
      field = project_with_question('only_there', created_at: 3.days.ago)
      answer = answer_without_field(idea, 'only_there_other')
      log_move(idea, from: field.resource.participation_context)

      run

      expect(answer.reload.custom_field_id).to eq field.id
    end

    it 'deletes the answer when two projects that existed at its creation have the question' do
      field = project_with_question('only_there', created_at: 3.days.ago)
      project_with_question('only_there', created_at: 4.days.ago)
      answer = answer_without_field(idea, 'only_there')
      log_move(idea, from: field.resource.participation_context)

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end

    it 'deletes the answer when the project with the question was created after the input' do
      field = project_with_question('only_there', created_at: 1.day.ago)
      answer = answer_without_field(idea, 'only_there')
      log_move(idea, from: field.resource.participation_context)

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end
  end

  describe 'an answer of a record that did not move' do
    it 'deletes the answer of an input, also when another project has the question' do
      project_with_question('only_there', created_at: 3.days.ago)
      answer = answer_without_field(idea, 'only_there')

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end

    it 'deletes the answer of a survey response, which cannot have moved' do
      create(:idea_status_proposed)
      response = create(:native_survey_response)
      field = project_with_question('only_there', created_at: 3.days.ago)
      answer = answer_without_field(response, 'only_there')
      log_move(response, from: field.resource.participation_context)

      run

      expect(CustomFieldAnswer.where(id: answer.id)).not_to exist
    end

    it 'deletes the answer of a user' do
      create(:custom_field, key: 'pet')
      answer = answer_without_field(create(:user), 'pet')

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

  it 'leaves answers that have a field alone' do
    field = create(:custom_field_text, resource: create(:custom_form, participation_context: project), key: 'pet')
    answer = idea.custom_field_answers.create!(key: 'pet', value: 'cat', custom_field: field)

    expect { run }.not_to(change { answer.reload.attributes })
  end
end
# rubocop:enable RSpec/DescribeClass
