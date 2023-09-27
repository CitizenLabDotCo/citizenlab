# frozen_string_literal: true

module BulkImportIdeas
  class ImportGlobalIdeasService < ImportIdeasService
    def generate_example_xlsx
      XlsxService.new.hash_array_to_xlsx [
        {
          'ID' => '1',
          'Title_nl-BE' => 'Mijn idee titel',
          'Title_fr-BE' => 'Mon idée titre',
          'Body_nl-BE' => 'Mijn idee inhoud',
          'Body_fr-BE' => 'Mon idée contenu',
          'Email' => 'moderator@citizenlab.co',
          'First name' => 'Paul',
          'Last name' => 'Moderator',
          'Permission' => 'X',
          'Project' => 'Project 1',
          'Phase' => 1,
          'Image URL' => 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_in_meeting_graphic.png',
          'Date (dd-mm-yyyy)' => '18-07-2022',
          'Topics' => 'Mobility; Health and welfare',
          'Latitude' => 50.5035,
          'Longitude' => 6.0944,
          'Location Description' => 'Panorama sur les Hautes Fagnes / Hohes Venn'
        }
      ]
    end

    def parse_idea_rows(file)
      xlsx_ideas = parse_xlsx_ideas file
      ideas_to_idea_rows xlsx_ideas
    end

    def ideas_to_idea_rows(ideas_array)
      app_locales = AppConfiguration.instance.settings('core', 'locales')
      idea_rows = ideas_array.map do |xlsx_row|
        next if idea_blank? xlsx_row

        idea_row = {}

        title_multiloc = {}
        body_multiloc  = {}
        xlsx_row.each do |key, value|
          next unless key.include? '_'

          field, locale = key.split '_'
          raise Error.new 'bulk_import_ideas_locale_not_valid', value: locale if app_locales.exclude?(locale)

          case field
          when 'Title'
            title_multiloc[locale] = value
          when 'Body'
            body_multiloc[locale] = value
          end
        end

        idea_row[:id]                   = xlsx_row['ID']
        idea_row[:title_multiloc]       = title_multiloc
        idea_row[:body_multiloc]        = body_multiloc
        idea_row[:topic_titles]         = (xlsx_row['Topics'] || '').split(';').map(&:strip).select(&:present?)
        idea_row[:project_title]        = xlsx_row['Project']
        idea_row[:image_url]            = xlsx_row['Image URL']
        idea_row[:phase_rank]           = xlsx_row['Phase']
        idea_row[:published_at]         = xlsx_row['Date (dd-mm-yyyy)']
        idea_row[:latitude]             = xlsx_row['Latitude']
        idea_row[:longitude]            = xlsx_row['Longitude']
        idea_row[:location_description] = xlsx_row['Location Description']
        if xlsx_row['Permission']&.present?
          idea_row[:user_email]           = xlsx_row['Email']
          idea_row[:user_first_name]      = xlsx_row['First name']
          idea_row[:user_last_name]       = xlsx_row['Last name']
        end
        idea_row
      end
      idea_rows.compact
    end

    def import_as_draft?
      false
    end
  end
end
