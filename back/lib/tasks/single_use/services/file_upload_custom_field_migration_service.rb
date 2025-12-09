# frozen_string_literal: true

module Tasks
  module SingleUse
    module Services
      class FileUploadCustomFieldMigrationService
        def initialize
          @stats = { ideas: 0, file_fields: 0, ideas_updated: 0, errors: [] }
        end

        attr_reader :stats

        def migrate(persist_changes)
          Rails.logger.info 'Migrating file upload format for idea custom fields.'
          Rails.logger.info "Persist: #{persist_changes}"

          custom_field_keys = CustomField.where(input_type: 'file_upload', resource_type: 'CustomForm').pluck(:key)
          ideas = Idea.where.not(custom_field_values: {})
          @stats[:ideas] = ideas.count

          ideas.each do |idea|
            Rails.logger.info "MIGRATING IDEA: #{idea.id}."
            save_idea = false
            idea.custom_field_values.each do |key, value|
              next unless custom_field_keys.include? key

              file = IdeaFile.find_by(id: value)
              next unless file

              idea.custom_field_values[key] = { id: file.id, name: file.name }
              save_idea = true
              @stats[:file_fields] += 1
              Rails.logger.info "TRANSFORMED FILE: #{file.id} - #{file.name}"
            end

            if save_idea && persist_changes
              idea.save!
              @stats[:ideas_updated] += 1
            end
          end
        end
      end
    end
  end
end
