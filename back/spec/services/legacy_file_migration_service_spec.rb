require 'rails_helper'

describe Files::LegacyFileMigrationService do
  subject(:service) { described_class.new }

  describe '#migrate_all' do
    context 'when migrating survey responses with file upload custom fields' do
      let(:survey_response) { @survey_response }
      let(:file_upload_field) { @file_upload_field }
      let(:filename) { 'the-filename.pdf' }

      before do
        create(:idea_status_proposed)
        project = create(:single_phase_native_survey_project)
        custom_form = create(:custom_form, participation_context: project.phases.first)

        @file_upload_field = create(:custom_field_file_upload, resource: custom_form)

        @survey_response = create(
          :native_survey_response,
          project: project,
          creation_phase: project.phases.sole
        )

        idea_file = create(:idea_file, idea: @survey_response, name: filename)

        @survey_response.update!(custom_field_values: {
          @file_upload_field.key => { 'id' => idea_file.id, 'name' => filename },
          'other_field' => 'some value'
        })
      end

      it 'migrates all legacy files' do
        stats = service.migrate_all
        expect(stats.containers_migrated).to eq(1)
        expect(stats.files_migrated).to eq(1)

        attachment = survey_response.file_attachments.sole
        custom_field_values = survey_response.reload.custom_field_values

        ic attachment.id
        ic attachment.file_id
        expect(custom_field_values).to match(
          file_upload_field.key => { 'id' => attachment.id, 'name' => attachment.file.name },
          'other_field' => 'some value'
        )
      end
    end

    context 'when migrating mixed legacy file types across multiple containers' do
      before_all do
        project = create(:project)
        create_list(:project_file, 2, project: project)
          .each_with_index { |file, index| file.update!(ordering: index) }

        event = create(:event)
        create_list(:event_file, 2, event: event)

        create_list(:phase_file, 2)
        create_list(:static_page_file, 2)
        create_list(:project_folder_file, 2)
        create_list(:idea_file, 2)
      end

      it 'migrates all legacy files' do
        stats = nil
        expect { stats = service.migrate_all }
          .to change(Files::File, :count).by(12)
          .and change(Files::FileAttachment, :count).by(12)

        expect(stats.containers_migrated).to eq(10)
        expect(stats.files_migrated).to eq(12)
        expect(stats.files_skipped).to eq(0)
        expect(stats.errors).to be_empty

        ProjectFile.migrated.each do |project_file|
          attachment = project_file.migrated_file.attachments.sole
          expect(attachment.position).to eq project_file.ordering
        end
      end
    end

    context 'when migrating multiple project files from a single project' do
      before_all do
        project = create(:project)
        create_list(:project_file, 3, project: project)
      end

      it 'migrates all legacy files' do
        stats = service.migrate_all
        expect(stats.containers_migrated).to eq(1)
        expect(stats.files_migrated).to eq(3)
      end
    end

    context 'when migrating files with missing remote files' do
      let!(:project_file) do
        create(:project_file).tap do |file|
          file.update_column(:file, 'incorrect-name.pdf')
        end
      end

      it 'skips the file' do
        stats = service.migrate_all
        expect(stats.containers_migrated).to eq(1)
        expect(stats.files_migrated).to eq(0)
        expect(stats.files_skipped).to eq(1)
        expect(stats.errors).to be_empty

        expect(project_file.reload.migration_skipped_reason).to eq('File content missing')
      end
    end

    context 'when migrating files with errors' do
      let!(:project_file) { create(:project_file) }

      it 'rolls back the transaction and logs the error' do
        error_msg = 'no address for test.s3.eu-central-1.amazonaws.com'
        allow(service).to receive(:migrate_legacy_file) # rubocop:disable RSpec/SubjectStub
          .and_raise(StandardError, error_msg)

        stats = service.migrate_all

        expect(stats.containers_migrated).to eq(0)
        expect(stats.files_migrated).to eq(0)
        expect(stats.files_skipped).to eq(0)
        expect(stats.errors.first).to match(
          tenant_id: Tenant.current.id,
          tenant_host: Tenant.current.host,
          container_type: 'Project',
          container_id: project_file.project.id,
          legacy_file_type: 'ProjectFile',
          legacy_file_id: project_file.id,
          legacy_file_path: project_file.file.path,
          error_class: 'StandardError',
          error_msg: error_msg
        )
      end
    end
  end

  describe '#migrate_container' do
    it 'migrates legacy files for an event' do
      event = create(:event)
      legacy_files = create_list(:event_file, 2, event: event).each_with_index do |file, index|
        file.update!(ordering: index)
      end

      stats = nil
      expect { stats = service.migrate_container(event) }
        .to change(Files::File, :count).by(2)
        .and change(Files::FileAttachment, :count).by(2)

      expect(stats.files_migrated).to eq(2)
      expect(stats.files_skipped).to eq(0)
      expect(stats.containers_migrated).to eq(1)
      expect(stats.errors).to be_empty

      legacy_files.each(&:reload)
      expect(legacy_files).to all(be_migrated)

      legacy_files.each do |legacy_file|
        migrated_file = legacy_file.migrated_file
        attachment = migrated_file.attachments.sole

        expect(migrated_file.name).to eq legacy_file.name
        expect(migrated_file.created_at).to eq legacy_file.created_at
        expect(migrated_file.projects).to contain_exactly(event.project)
        expect(migrated_file.ai_processing_allowed).to be(false)
        expect(migrated_file.category).to eq 'other'
        expect(migrated_file.uploader).to be_nil

        expect(attachment.position).to eq legacy_file.ordering
        expect(attachment.attachable).to eq event
      end
    end
  end
end
