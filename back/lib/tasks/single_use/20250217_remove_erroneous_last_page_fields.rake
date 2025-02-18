require 'json'

namespace :single_use do
  desc 'Remove erroneous last page fields'
  # This task removes the 'survey_end' page fields that were mistakenly created.
  # Specifically, it removes these fields from custom forms associated with phases that
  # are:
  # - not native surveys and
  # - contain only one page field.
  # The reason for the second condition is that if a form has multiple page fields, it was
  # likely part of a native survey at some point and this task does not aim to address
  # issues related to changes in participation methods.
  #
  # Usage:
  #   rails single_use:remove_erroneous_last_page_fields DRY_RUN=true
  #   rails single_use:remove_erroneous_last_page_fields # live run
  task remove_erroneous_last_page_fields: :environment do
    dry_run = ENV['DRY_RUN'].present?

    Rails.logger.info(
      'Starting rake task',
      mode: dry_run ? 'dry-run' : 'live',
      task: 'remove_erroneous_last_page_fields'
    )

    Tenant.safe_switch_each do |tenant|
      invalid_phases = Phase
        .joins(custom_form: :custom_fields)
        .where.not(participation_method: 'native_survey')
        .where(custom_fields: { input_type: 'page', key: 'survey_end' })
        .group(:id)
        .having('COUNT(*) = 1')

      fields_to_delete = CustomField
        .where(input_type: 'page', key: 'survey_end')
        .joins(:custom_form).where(custom_forms: { participation_context_id: invalid_phases })

      next if fields_to_delete.empty?

      Rails.logger.info('Deleting custom fields', fields: fields_to_delete.ids, tenant: tenant.host, count: fields_to_delete.count)
      fields_to_delete.destroy_all unless dry_run
    end
  end
end
