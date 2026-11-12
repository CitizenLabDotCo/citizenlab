# frozen_string_literal: true

# Gives every custom field answer a field, or deletes it (TAN-8863).
#
# An answer can be without a field because its question was deleted before deleting a question
# also deleted its answers, or because its input moved to a project whose form does not have
# the question. An input that holds such an answer cannot be edited.
#
# First pass: re-attach an answer when its question still exists, in the form its record is in
# or, for an input that moved, in the form of a project it was in before. Second pass: delete
# the answers that are still without a field.
#
# There is no dry run: try it on a sandbox copy of the database.
#
#   rake single_use:repair_custom_field_answers_without_field             # all tenants
#   rake 'single_use:repair_custom_field_answers_without_field[foo.com]'  # one tenant
namespace :single_use do
  desc 'Re-attach custom field answers without a field to their question, and delete the rest.'
  task :repair_custom_field_answers_without_field, %i[host] => [:environment] do |_t, args|
    TenantScript.run(
      'repair_custom_field_answers_without_field',
      args: { execute: 'execute', host: args[:host] },
      description: 'repairing custom field answers without a field'
    ) do |tenant, script|
      rake_20261110_reattach_answers(tenant, script.reporter)
      rake_20261110_delete_answers_without_field(tenant, script.reporter)
    end
  end
end

def rake_20261110_reattach_answers(tenant, reporter)
  CustomFieldAnswer.where(custom_field_id: nil).includes(:answerable).find_each do |answer|
    context = rake_20261110_context(tenant, answer)
    field = rake_20261110_field_for(answer)
    next if !field

    if answer.update(custom_field: field)
      reporter.add_change(nil, field.id, context: context)
    else
      reporter.add_error("not re-attached: #{answer.errors.full_messages.to_sentence}", context: context)
    end
  rescue StandardError => e
    reporter.add_error("#{e.class}: #{e.message}", context: context)
  end
end

def rake_20261110_delete_answers_without_field(tenant, reporter)
  CustomFieldAnswer.where(custom_field_id: nil).find_each do |answer|
    context = rake_20261110_context(tenant, answer)

    if answer.destroy
      reporter.add_delete('CustomFieldAnswer', answer.id, context: context)
    else
      reporter.add_error('not deleted', context: context)
    end
  rescue StandardError => e
    reporter.add_error("#{e.class}: #{e.message}", context: context)
  end
end

def rake_20261110_field_for(answer)
  record = answer.answerable
  return if !record
  return rake_20261110_find_field(CustomField.registration, answer.key) if record.is_a?(User)

  field = rake_20261110_find_field(record.custom_form.custom_fields, answer.key)
  return field if field

  prefix = UserFieldsInFormService.prefix
  if answer.key.start_with?(prefix)
    rake_20261110_find_field(CustomField.registration, answer.key.delete_prefix(prefix))
  elsif !record.creation_phase_id
    rake_20261110_field_in_previous_project(record, answer.key)
  end
end

# Newest move first: an answer followed its key into every project whose form had the question,
# so it last belonged to the question of the most recent one.
def rake_20261110_field_in_previous_project(idea, key)
  moves = Activity.where(item: idea, action: 'changed').where("payload->'change' ? 'project_id'")

  moves.order(acted_at: :desc).each do |move|
    previous_project_id = move.payload.dig('change', 'project_id', 0)
    form = CustomForm.find_by(participation_context_type: 'Project', participation_context_id: previous_project_id)
    field = form && rake_20261110_find_field(form.custom_fields, key)
    return field if field
  end
  nil
end

# An _other or _follow_up answer belongs to the question of its base key.
def rake_20261110_find_field(fields, key)
  base_key = key.delete_suffix('_other').delete_suffix('_follow_up')
  fields.find_by(key: key) || fields.find_by(key: base_key)
end

# Without the value, which can be personal data.
def rake_20261110_context(tenant, answer)
  { tenant: tenant.host, answerable_type: answer.answerable_type, answerable_id: answer.answerable_id, key: answer.key }
end
