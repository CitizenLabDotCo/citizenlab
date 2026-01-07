# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class ProjectExtractor < BaseExtractor
    def initialize(locale, config, xlsx_folder_path)
      super(locale, config)
      @xlsx_folder_path = xlsx_folder_path
      @workbook = RubyXL::Parser.parse_buffer(open("#{xlsx_folder_path}/projects.xlsx").read)
    end

    # Return a list of projects, with phases and content
    def projects
      projects = @workbook.worksheets[0].drop(1).map do |row|
        next if project_column(row, 'Import?')&.downcase == 'no' # Skip projects that we have marked as 'no' in the 'Import' column

        title = project_column(row, 'ProjectName')
        next unless title

        id = project_column(row, 'ID') # Project ID - if we need to update an existing project
        publication_status = project_column(row, 'Status')&.downcase || 'draft'
        description_html = project_column(row, 'DescriptionHtml') || ''
        attachments = attachments(row)
        thumbnail_url = image_attachment_or_url(row, 'ThumbnailUrl', attachments)
        banner_url = image_attachment_or_url(row, 'BannerUrl', attachments)

        # Extract phases (if there are any)
        phases = phase_details[title]&.map do |phase|
          returned_phase = information_phase(phase[:attributes]) # Information phase is default when no type is specified
          unless phase[:type].nil?
            klass_name = "BulkImportIdeas::Extractors::#{phase[:type]}PhaseExtractor"
            extractor = klass_name.constantize.new(
              locale,
              import_config,
              phase[:file],
              phase[:tab],
              phase[:attributes],
              phase[:append_ideas]
            )
            returned_phase = extractor.phase
          end
          returned_phase
        end

        {
          id: id,
          title_multiloc: multiloc(title),
          description_multiloc: multiloc(description_html),
          slug: SlugService.new.slugify(title),
          thumbnail_url: thumbnail_url,
          banner_url: banner_url,
          admin_publication_attributes: {
            publication_status: publication_status
          },
          visible_to: 'admins',
          phases: phases,
          attachments: attachments
        }
      end

      projects.compact
    end

    # Extracts any additional field configuration from the second worksheet of the XLSX file.
    def import_config
      @import_config ||= begin
        config = {
          ignored_columns: [],
          user_columns: [],
          renamed_columns: {},
          override_field_types: {}
        }
        @workbook.worksheets[2].drop(1).each do |row|
          column_name = clean_string_value(row.cells[0].value)
          next if column_name.blank?

          config[:user_columns] << column_name if row.cells[1]&.value&.downcase == 'user'
          config[:ignored_columns] << column_name if row.cells[3]&.value&.downcase == 'yes'
          config[:override_field_types][column_name] = row.cells[2]&.value if row.cells[2]&.value.present?
          config[:renamed_columns][column_name] = row.cells[4]&.value if row.cells[4]&.value.present?
        end
        config
      end
    end

    private

    def phase_details
      phases = {}
      @workbook.worksheets[1].drop(1).each do |row|
        project_title = row.cells[0]&.value
        id = row.cells[8]&.value # Phase ID - if we need to update an existing phase instead of creating a new one
        next unless project_title

        phases[project_title] ||= []
        phases[project_title] << {
          file: row.cells[5]&.value.present? ? "#{@xlsx_folder_path}/inputs/#{row.cells[5].value}" : nil,
          tab: row.cells[6]&.value,
          type: row.cells[7]&.value.presence || nil,
          append_ideas: row.cells[9]&.value.to_s.downcase == 'yes' || false,
          attributes: {
            id: id,
            title: row.cells[1].value,
            description: row.cells[2].value,
            start_at: row.cells[3]&.value.presence || nil,
            end_at: row.cells[4]&.value.presence || nil
          }
        }
      end
      phases
    end

    def information_phase(phase_attributes)
      {
        id: phase_attributes[:id],
        title_multiloc: multiloc(phase_attributes[:title]),
        description_multiloc: multiloc(phase_attributes[:description]),
        start_at: phase_attributes[:start_at],
        end_at: phase_attributes[:end_at],
        participation_method: 'information',
        idea_custom_fields: [],
        user_custom_fields: [],
        idea_rows: []
      }
    end

    def image_attachment_or_url(row, column_name, attachments)
      value = project_column(row, column_name)
      return unless value

      unless value.starts_with?('http://', 'https://')
        return if attachments.empty?

        # Find the image in the attachments and then remove it from the attachments array
        index = attachments.find_index { |v| v.include?(value) }
        value = index ? attachments[index] : nil
        attachments.delete_at(index) if index
      end
      value
    end

    def attachments(row)
      folder_name = project_column(row, 'AttachmentsFolder')
      return [] if folder_name.blank?

      attachments_folder = "#{@xlsx_folder_path}/attachments/#{folder_name}"
      paths = Dir.glob("#{attachments_folder}/**/*").select do |file_path|
        File.file?(file_path)
      end

      return paths unless upload_attachments_to_s3? # If not uploading to S3, return local paths

      s3_attachment_paths(paths)
    end

    def s3_attachment_paths(file_paths)
      attachments_path = File.join(@xlsx_folder_path, 'attachments')

      bucket = ENV.fetch('AWS_S3_BUCKET')
      tenant_id = Tenant.current.id

      # Upload each file in the attachments folder
      file_paths.map do |file_path|
        next unless File.file?(file_path)

        # Construct S3 key from relative path in attachments folder
        relative_path = file_path.sub("#{attachments_path}/", '')
        s3_key = "imports/#{tenant_id}/attachments/#{relative_path}"

        # Upload file to S3
        File.open(file_path, 'rb') do |file|
          s3_client.put_object(
            bucket: bucket,
            key: s3_key,
            body: file
          )
        end

        s3_key
      end
    end

    def upload_attachments_to_s3?
      return true unless Rails.env.development?

      ENV['USE_AWS_S3_IN_DEV'] == 'true'
    end

    def s3_client
      @s3_client ||= Aws::S3::Client.new(region: ENV.fetch('AWS_REGION'))
    end

    def project_column(row, column_name)
      # Define the columns in the order they appear in the XLSX
      columns = %w[ProjectName	Status	DescriptionHtml	AttachmentsFolder ThumbnailUrl	BannerUrl	ID Import?]
      col_index = columns.index(column_name)
      col_index ? row.cells[col_index]&.value : nil
    end
  end
end
