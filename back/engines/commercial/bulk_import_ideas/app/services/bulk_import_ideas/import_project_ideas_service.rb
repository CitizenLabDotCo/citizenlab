# frozen_string_literal: true

module BulkImportIdeas
  class ImportProjectIdeasService < ImportIdeasService

    def initialize(project_id)
      @project_id = project_id
      super()
    end

    def generate_example_xlsx
      XlsxService.new.hash_array_to_xlsx [
       {
         'ID' => '1',
         'Title_nl-BE' => 'Mijn idee titel',
         'Title_fr-BE' => 'Mon idée titre',
         'Body_nl-BE' => 'Mijn idee inhoud',
         'Body_fr-BE' => 'Mon idée contenu',
         'Email' => 'moderator@citizenlab.co',
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
  end
end
