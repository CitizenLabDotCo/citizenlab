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
      phases_with_1page = Phase
        .joins(custom_form: :custom_fields)
        .where.not(participation_method: 'native_survey')
        .where(custom_fields: { input_type: 'page' })
        .group(:id)
        .having('COUNT(*) = 1')

      fields_to_delete = CustomField
        .where(input_type: 'page', key: 'survey_end')
        .joins(:custom_form).where(custom_forms: { participation_context_id: phases_with_1page })

      next if fields_to_delete.empty?

      Rails.logger.info('Deleting custom fields', fields: fields_to_delete.ids, tenant: tenant.host, count: fields_to_delete.count)
      fields_to_delete.destroy_all unless dry_run
    end
  end

  task restore_last_page_fields: :environment do
    dry_run = ENV['DRY_RUN'].present?

    Rails.logger.info(
      'Starting rake task',
      mode: dry_run ? 'dry-run' : 'live',
      task: 'restore_last_page_fields'
    )

    Tenant.safe_switch_each do |tenant|
      phases_with_end_page = Phase
        .joins(custom_form: :custom_fields)
        .where(custom_fields: { input_type: 'page', key: 'survey_end' })

      phases_missing_end_page = Phase
        .joins(custom_form: :custom_fields)
        .where(custom_fields: { input_type: 'page' })
        .where.not(id: phases_with_end_page)
        .distinct

      next if phases_missing_end_page.empty?

      Rails.logger.info(
        'Phases with missing last page fields',
        count: phases_missing_end_page.count,
        ids: phases_missing_end_page.ids,
        tenant: tenant.host
      )

      next if dry_run

      phases_missing_end_page.each do |phase|
        CustomField.create!(
          id: SecureRandom.uuid,
          key: 'survey_end',
          resource: phase.custom_form,
          input_type: 'page',
          page_layout: 'default',
          title_multiloc: MultilocService.new.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
          description_multiloc: MultilocService.new.i18n_to_multiloc('form_builder.form_end_page.description_text_3')
        )
      end
    end
  end
end
