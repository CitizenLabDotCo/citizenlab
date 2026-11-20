# frozen_string_literal: true

# Gives every custom field answer a field, or deletes it (TAN-8863).
#
# An answer can be without a field because its question was deleted before deleting a question
# also deleted its answers, or because its input moved to a project whose form does not have
# the question. An input that holds such an answer cannot be edited.
#
# First pass: re-attach the answers of an input that moved, when exactly one project that existed
# when the input was created has a question with the answer's key. Second pass: delete the
# answers that are still without a field.
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

# Only an input that moved can have a question outside the form it is in. Its question is then
# in a project that already existed when the input was created. If several do, we cannot tell.
def rake_20261110_field_for(answer)
  idea = answer.answerable
  return if !idea.is_a?(Idea) || idea.creation_phase_id || !rake_20261110_moved?(idea)

  fields = rake_20261110_fields_at_creation(idea, answer.key).to_a
  fields.first if fields.one?
end

# Moves are only logged since May 2024. An older move shows in the input predating its project.
def rake_20261110_moved?(idea)
  idea.created_at < idea.project.created_at ||
    Activity.where(item: idea, action: 'changed').where("payload->'change' ? 'project_id'").exists?
end

# An _other or _follow_up answer belongs to the question of its base key.
def rake_20261110_fields_at_creation(idea, key)
  base_key = key.delete_suffix('_other').delete_suffix('_follow_up')
  projects = Project.where(created_at: ..idea.created_at)
  forms = CustomForm.where(participation_context_type: 'Project', participation_context_id: projects.select(:id))
  CustomField.where(resource: forms, key: base_key)
end

# Without the value, which can be personal data.
def rake_20261110_context(tenant, answer)
  { tenant: tenant.host, answerable_type: answer.answerable_type, answerable_id: answer.answerable_id, key: answer.key }
end
