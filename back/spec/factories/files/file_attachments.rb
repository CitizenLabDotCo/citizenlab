# frozen_string_literal: true

FactoryBot.define do
  factory :file_attachment, class: 'Files::FileAttachment' do
    # There is a bit of gymnastics here, but this allows us to create a simple interface
    # for the factory while still creating consistent data.
    #
    # Known limitation:
    #   build(:file_attachment).save!
    # fails because Rails does not persist the records in an order that is compatible with
    # the different database constraints and validations.
    #
    # @example Create a file attachment for an event.
    #   fa = create(:file_attachment)
    #   fa.file.projects.first == fa.attachable.project # => true
    #
    # @example Create a file attachment for a project
    #   fa = create(:file_attachment, to: :project)
    #   fa.file.projects.first == fa.attachable # => true
    #
    # @example Create a file attachment for a static page (global file)
    #   fa = create(:file_attachment, to: :static_page)
    #   fa.file.projects # => []
    #
    # @example Create a file attachment for a global file
    #   file = create(:global_file)
    #   fa = create(:file_attachment, file: file)
    #   fa.file.projects # => []
    #
    # @example Create a file attachment for a project file
    #   file = create(:file)
    #   fa = create(:file_attachment, file: file)
    #   fa.file.projects.first == fa.attachable.project # => true
    #
    # @example It's still possible to mess things up
    #   create(:file_attachment, to: :project, file: create(:global_file))
    transient do
      # `to` must be the name of a factory for an attachable resource.
      to do
        file = @overrides[:file]
        file.present? && file.projects.empty? ? :static_page : :event
      end
    end

    attachable do
      # @overrides allow us to break the circular dependency between file and attachable
      # and stack overflow errors.
      project = @overrides[:file]&.projects&.first

      if project.present?
        to == :project ? project : association(to, project: project)
      else
        association(to)
      end
    end

    file do
      project = attachable.try(:project)
      project.present? ? association(:file, projects: [project]) : association(:global_file)
    end
  end
end
