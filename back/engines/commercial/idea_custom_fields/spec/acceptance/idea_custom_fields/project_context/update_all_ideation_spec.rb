# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'
  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature! 'idea_custom_fields'
  end

  patch 'web_api/v1/admin/projects/:project_id/custom_fields/update_all' do
    parameter :custom_fields, type: :array
    with_options scope: 'custom_fields[]' do
      parameter :id, 'The ID of an existing custom field to update. When the ID is not provided, a new field is created.', required: false
      # TODO: add code
      parameter :input_type, 'The type of the input. Required when creating a new field.', required: false
      parameter :required, 'Whether filling out the field is mandatory', required: false
      parameter :enabled, 'Whether the field is active or not', required: false
      parameter :title_multiloc, 'A title of the field, as shown to users, in multiple locales', required: false
      parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
      parameter :options, type: :array
      parameter :logic, 'The logic JSON for the field'
    end
    with_options scope: 'options[]' do
      parameter :id, 'The ID of an existing custom field option to update. When the ID is not provided, a new option is created.', required: false
      parameter :title_multiloc, 'A title of the option, as shown to users, in multiple locales', required: false
    end

    let(:context) { create :continuous_project, participation_method: 'ideation' }
    let!(:custom_form) { create :custom_form, :with_default_fields, participation_context: context }
    let(:project_id) { context.id }
    let(:participation_method) { Factory.instance.participation_method_for context }
    # let(:default_fields_param) do
    #   attributes = %i[id code input_type title_multiloc description_multiloc required enabled]
    #   participation_method.default_fields(custom_form).map do |field|
    #     {}.tap do |field_param|
    #       attributes.each do |attribute|
    #         field_param[attribute] = field[attribute]
    #       end
    #     end
    #   end
    # end
    let(:default_fields_param) do
      attributes = %i[id code input_type title_multiloc description_multiloc required enabled]
      IdeaCustomFieldsService.new(custom_form).all_fields.map do |field|
        {}.tap do |field_param|
          attributes.each do |attribute|
            field_param[attribute] = field[attribute]
          end
        end
      end
    end

    # First time, when not persisted yet
    # Built-in fields
    # Do not allow logic
    # key and code should be preserved
    # input_type cannot be updated

    context 'when admin' do
      before { admin_header_token }

      example 'Add, update and remove a field' do
        fields_param = default_fields_param # https://stackoverflow.com/a/58695857/3585671
        # Update persisted built-in field
        fields_param[1] = {
          id: custom_form.custom_fields.find_by(code: 'title_multiloc').id,
          title_multiloc: { 'en' => 'New input title' }
        }
        # Remove extra field
        deleted_field = create :custom_field_linear_scale, :for_custom_form
        # Add extra field
        fields_param += [{
          input_type: 'select',
          title_multiloc: { 'en' => 'Select field title' },
          description_multiloc: { 'en' => 'Select field description' },
          required: false,
          enabled: true,
          options: [
            { title_multiloc: { 'en' => 'Field 1' } },
            { title_multiloc: { 'en' => 'Field 2' } }
          ]
        }]

        do_request custom_fields: fields_param

        assert_status 200
        json_response = json_parse response_body
        # expect(json_response[:data].size).to eq 10
        expect(json_response[:data].pluck(:id)).not_to include(deleted_field.id)
        # section 1
        expect(json_response[:data][1]).to match(hash_including(
          attributes: hash_including(
            code: 'title_multiloc',
            key: 'title_multiloc',
            input_type: 'text_multiloc',
            title_multiloc: { en: 'New input title' },
            description_multiloc: {},
            ordering: 1,
            required: true,
            enabled: true,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String),
            logic: {}
          ),
          type: 'custom_field',
          relationships: { options: { data: [] } }
        ))
        expect(json_response[:data][2]).to match(hash_including(
          attributes: hash_including(
            code: 'body_multiloc',
            key: 'body_multiloc',
            input_type: 'html_multiloc',
            ordering: 2,
            title_multiloc: hash_including(en: 'Description'),
            description_multiloc: {},
            required: true,
            enabled: true,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String),
            logic: {}
          ),
          type: 'custom_field',
          relationships: { options: { data: [] } }
        ))
        expect(json_response[:data][9]).to match(hash_including(
          attributes: hash_including(
            code: 'proposed_budget',
            key: 'proposed_budget',
            input_type: 'number',
            ordering: 9,
            title_multiloc: hash_including(en: 'Proposed Budget'),
            description_multiloc: {},
            required: false,
            enabled: false,
            created_at: an_instance_of(String),
            updated_at: an_instance_of(String),
            logic: {}
          ),
          type: 'custom_field',
          relationships: { options: { data: [] } }
        ))
        # expect(json_response[:data][0]).to match({
        #   attributes: {
        #     code: nil,
        #     created_at: an_instance_of(String),
        #     description_multiloc: page1.description_multiloc.symbolize_keys,
        #     enabled: true,
        #     input_type: 'page',
        #     key: page1.key,
        #     ordering: 0,
        #     required: false,
        #     title_multiloc: page1.title_multiloc.symbolize_keys,
        #     updated_at: an_instance_of(String),
        #     logic: {}
        #   },
        #   id: page1.id,
        #   type: 'custom_field',
        #   relationships: { options: { data: [] } }
        # })

        # {:data=>
        #   [
        #    {:id=>"1af7040d-9ff6-463d-8bb8-58c53356b9f1",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"proposed_budget",
        #       :input_type=>"number",
        #       :title_multiloc=>
        #        {:en=>"Proposed Budget",
        #         :"ar-MA"=>"الميزانية المُقترحة",
        #         :"ar-SA"=>"الميزانية المُقترحة",
        #         :"ca-ES"=>"Proposed Budget",
        #         :"da-DK"=>"Estimeret Budget",
        #         :"de-DE"=>"Vorgeschlagenes Budget",
        #         :"el-GR"=>"Proposed Budget",
        #         :"en-CA"=>"Proposed Budget",
        #         :"en-GB"=>"Proposed Budget",
        #         :"es-CL"=>"Proyecto de presupuesto",
        #         :"es-ES"=>"Proyecto de presupuesto",
        #         :"fr-BE"=>"Proposition de budget",
        #         :"fr-FR"=>"Proposition de budget",
        #         :"hr-HR"=>"Predloženi proračun",
        #         :"hu-HU"=>"Proposed Budget",
        #         :"it-IT"=>"Bilancio proposto",
        #         :"kl-GL"=>"Proposed Budget",
        #         :"lb-LU"=>"Proposéierte Budget",
        #         :"lv-LV"=>"Ierosinātais budžets",
        #         :mi=>"Proposed Budget",
        #         :"nb-NO"=>"Proposed Budget",
        #         :"nl-BE"=>"Voorgesteld budget",
        #         :"nl-NL"=>"Voorgesteld budget",
        #         :"pl-PL"=>"Proponowany budżet",
        #         :"pt-BR"=>"Orçamento proposto",
        #         :"ro-RO"=>"Buget propus",
        #         :"sr-Latn"=>"Predloženi budžet",
        #         :"sr-SP"=>"Предложени буџет",
        #         :"sv-SE"=>"Budgetförslag",
        #         :"tr-TR"=>"Öngörülen Bütçe"},
        #       :required=>false,
        #       :ordering=>4,
        #       :enabled=>false,
        #       :code=>"proposed_budget",
        #       :created_at=>nil,
        #       :updated_at=>nil,
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"acefd732-6356-4393-89f1-e3a87ceee54c",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"topic_ids",
        #       :input_type=>"multiselect",
        #       :title_multiloc=>
        #        {:en=>"Tags",
        #         :"ar-MA"=>"الموضوعات",
        #         :"ar-SA"=>"الموضوعات",
        #         :"ca-ES"=>"Etiquetes",
        #         :"da-DK"=>"Emner",
        #         :"de-DE"=>"Themen",
        #         :"el-GR"=>"Ετικέτες",
        #         :"en-CA"=>"Tags",
        #         :"en-GB"=>"Tags",
        #         :"es-CL"=>"Temas",
        #         :"es-ES"=>"Temas",
        #         :"fr-BE"=>"Étiquettes",
        #         :"fr-FR"=>"Étiquettes",
        #         :"hr-HR"=>"Oznake",
        #         :"hu-HU"=>"Topics",
        #         :"it-IT"=>"Argomenti",
        #         :"kl-GL"=>"Pineqartut",
        #         :"lb-LU"=>"Sujeten",
        #         :"lv-LV"=>"Tagi",
        #         :mi=>"Topics",
        #         :"nb-NO"=>"Emner",
        #         :"nl-BE"=>"Tags",
        #         :"nl-NL"=>"Tags",
        #         :"pl-PL"=>"Tematy",
        #         :"pt-BR"=>"Tópicos",
        #         :"ro-RO"=>"Subiecte",
        #         :"sr-Latn"=>"Tema",
        #         :"sr-SP"=>"Теме",
        #         :"sv-SE"=>"Topics",
        #         :"tr-TR"=>"Etiketler"},
        #       :required=>false,
        #       :ordering=>5,
        #       :enabled=>true,
        #       :code=>"topic_ids",
        #       :created_at=>nil,
        #       :updated_at=>nil,
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"a83d6505-bf11-4a23-805a-69d4ca6568c2",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"location_description",
        #       :input_type=>"text",
        #       :title_multiloc=>
        #        {:en=>"Location",
        #         :"ar-MA"=>"الموقع",
        #         :"ar-SA"=>"الموقع",
        #         :"ca-ES"=>"Ubicació",
        #         :"da-DK"=>"Beliggenhed",
        #         :"de-DE"=>"Standort",
        #         :"el-GR"=>"Τοποθεσία",
        #         :"en-CA"=>"Location",
        #         :"en-GB"=>"Location",
        #         :"es-CL"=>"Ubicación",
        #         :"es-ES"=>"Ubicación",
        #         :"fr-BE"=>"Adresse",
        #         :"fr-FR"=>"Adresse",
        #         :"hr-HR"=>"Lokacija",
        #         :"hu-HU"=>"Location",
        #         :"it-IT"=>"Posizione",
        #         :"kl-GL"=>"Sumi",
        #         :"lb-LU"=>"Standuert",
        #         :"lv-LV"=>"Atrašanās vieta",
        #         :mi=>"Location",
        #         :"nb-NO"=>"Lokalitet",
        #         :"nl-BE"=>"Locatie",
        #         :"nl-NL"=>"Locatie",
        #         :"pl-PL"=>"Lokalizacja",
        #         :"pt-BR"=>"Localização",
        #         :"ro-RO"=>"Locație",
        #         :"sr-Latn"=>"Lokacija",
        #         :"sr-SP"=>"Локација",
        #         :"sv-SE"=>"Plats",
        #         :"tr-TR"=>"Konum"},
        #       :required=>false,
        #       :ordering=>6,
        #       :enabled=>true,
        #       :code=>"location_description",
        #       :created_at=>nil,
        #       :updated_at=>nil,
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"43f9c803-e666-49fb-beba-8bfeb4f44994",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"idea_images_attributes",
        #       :input_type=>"image_files",
        #       :title_multiloc=>
        #        {:en=>"Images",
        #         :"ar-MA"=>"الصور",
        #         :"ar-SA"=>"الصور",
        #         :"ca-ES"=>"Images",
        #         :"da-DK"=>"Billeder",
        #         :"de-DE"=>"Bilder",
        #         :"el-GR"=>"Images",
        #         :"en-CA"=>"Images",
        #         :"en-GB"=>"Images",
        #         :"es-CL"=>"Imágenes",
        #         :"es-ES"=>"Imágenes",
        #         :"fr-BE"=>"Images",
        #         :"fr-FR"=>"Images",
        #         :"hr-HR"=>"Slike",
        #         :"hu-HU"=>"Images",
        #         :"it-IT"=>"Immagini",
        #         :"kl-GL"=>"Assit",
        #         :"lb-LU"=>"Biller",
        #         :"lv-LV"=>"Attēli",
        #         :mi=>"Images",
        #         :"nb-NO"=>"Bilder",
        #         :"nl-BE"=>"Afbeeldingen",
        #         :"nl-NL"=>"Afbeeldingen",
        #         :"pl-PL"=>"Zdjęcia",
        #         :"pt-BR"=>"Imagens",
        #         :"ro-RO"=>"Imagini",
        #         :"sr-Latn"=>"Slike",
        #         :"sr-SP"=>"Слике",
        #         :"sv-SE"=>"Bilder",
        #         :"tr-TR"=>"Görseller"},
        #       :required=>false,
        #       :ordering=>7,
        #       :enabled=>true,
        #       :code=>"idea_images_attributes",
        #       :created_at=>nil,
        #       :updated_at=>nil,
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"d3545552-6221-4c40-9c9c-fe03e689ffc4",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"idea_files_attributes",
        #       :input_type=>"files",
        #       :title_multiloc=>
        #        {:en=>"Attachments",
        #         :"ar-MA"=>"المُرفقات",
        #         :"ar-SA"=>"المُرفقات",
        #         :"ca-ES"=>"Adjunts",
        #         :"da-DK"=>"Vedhæftede filer",
        #         :"de-DE"=>"Anhänge",
        #         :"el-GR"=>"Συνημμένα αρχεία",
        #         :"en-CA"=>"Other files",
        #         :"en-GB"=>"Other files",
        #         :"es-CL"=>"Archivos adjuntos",
        #         :"es-ES"=>"Archivos adjuntos",
        #         :"fr-BE"=>"Pièces jointes",
        #         :"fr-FR"=>"Pièces jointes",
        #         :"hr-HR"=>"Privici",
        #         :"hu-HU"=>"Other files",
        #         :"it-IT"=>"Allegati",
        #         :"kl-GL"=>"Filit ilanngussat",
        #         :"lb-LU"=>"Annexen",
        #         :"lv-LV"=>"Pielikumi",
        #         :mi=>"Attachments",
        #         :"nb-NO"=>"Vedlegg",
        #         :"nl-BE"=>"Bijlagen",
        #         :"nl-NL"=>"Bijlagen",
        #         :"pl-PL"=>"Załączniki",
        #         :"pt-BR"=>"Anexos",
        #         :"ro-RO"=>"Fișiere atașate",
        #         :"sr-Latn"=>"Prilozi",
        #         :"sr-SP"=>"Прилози",
        #         :"sv-SE"=>"Bilagor",
        #         :"tr-TR"=>"Ekler"},
        #       :required=>false,
        #       :ordering=>8,
        #       :enabled=>true,
        #       :code=>"idea_files_attributes",
        #       :created_at=>nil,
        #       :updated_at=>nil,
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"3d82479d-3dba-4772-9ea1-9460434093ca",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"description",
        #       :input_type=>"html_multiloc",
        #       :title_multiloc=>
        #        {:en=>"Description",
        #         :mi=>"Description",
        #         :"ar-MA"=>"الوصف",
        #         :"ar-SA"=>"الوصف",
        #         :"ca-ES"=>"Descripció",
        #         :"da-DK"=>"Beskrivelse",
        #         :"de-DE"=>"Beschreibung",
        #         :"el-GR"=>"Περιγραφή",
        #         :"en-CA"=>"Description",
        #         :"en-GB"=>"Description",
        #         :"es-CL"=>"Descripción",
        #         :"es-ES"=>"Descripción",
        #         :"fr-BE"=>"Description complète",
        #         :"fr-FR"=>"Description",
        #         :"hr-HR"=>"Opis",
        #         :"hu-HU"=>"Description",
        #         :"it-IT"=>"Descrizione",
        #         :"kl-GL"=>"Nassuiaat",
        #         :"lb-LU"=>"Beschreiwung",
        #         :"lv-LV"=>"Apraksts",
        #         :"nb-NO"=>"Beskrivelse",
        #         :"nl-BE"=>"Beschrijving",
        #         :"nl-NL"=>"Beschrijving",
        #         :"pl-PL"=>"Opis",
        #         :"pt-BR"=>"Descrição",
        #         :"ro-RO"=>"Descriere",
        #         :"sr-SP"=>"Опис",
        #         :"sv-SE"=>"Beskrivning",
        #         :"tr-TR"=>"Açıklama",
        #         :"sr-Latn"=>"Opis"},
        #       :required=>true,
        #       :ordering=>2,
        #       :enabled=>true,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.298Z",
        #       :updated_at=>"2023-01-13T09:41:18.298Z",
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"59b0c15d-65fb-4c31-8f80-53c9f725e6d1",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"author",
        #       :input_type=>"text",
        #       :title_multiloc=>
        #        {:en=>"Author",
        #         :mi=>"Author",
        #         :"ar-MA"=>"المؤلف",
        #         :"ar-SA"=>"المؤلف",
        #         :"ca-ES"=>"Autor",
        #         :"da-DK"=>"Forfatter",
        #         :"de-DE"=>"Autor",
        #         :"el-GR"=>"Συντάκτης",
        #         :"en-CA"=>"Author",
        #         :"en-GB"=>"Author",
        #         :"es-CL"=>"Autor",
        #         :"es-ES"=>"Autor",
        #         :"fr-BE"=>"Auteur",
        #         :"fr-FR"=>"Auteur",
        #         :"hr-HR"=>"Autor",
        #         :"hu-HU"=>"Author",
        #         :"it-IT"=>"Autore",
        #         :"kl-GL"=>"Allattoq",
        #         :"lb-LU"=>"Auteur",
        #         :"lv-LV"=>"Autors",
        #         :"nb-NO"=>"Forfatter",
        #         :"nl-BE"=>"Auteur",
        #         :"nl-NL"=>"Auteur",
        #         :"pl-PL"=>"Autor",
        #         :"pt-BR"=>"Autor",
        #         :"ro-RO"=>"Autor",
        #         :"sr-SP"=>"Аутор",
        #         :"sv-SE"=>"Författare",
        #         :"tr-TR"=>"Yazan",
        #         :"sr-Latn"=>"Autor"},
        #       :required=>false,
        #       :ordering=>3,
        #       :enabled=>true,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.320Z",
        #       :updated_at=>"2023-01-13T09:41:18.320Z",
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"6fb46cf7-2c30-4e70-93cd-62f9f4a4fbc0",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"budget",
        #       :input_type=>"number",
        #       :title_multiloc=>
        #        {:en=>"Budget",
        #         :mi=>"Budget",
        #         :"ar-MA"=>"الميزانية",
        #         :"ar-SA"=>"الميزانية",
        #         :"ca-ES"=>"Pressupost",
        #         :"da-DK"=>"Budget",
        #         :"de-DE"=>"Budget",
        #         :"el-GR"=>"Προϋπολογισμός",
        #         :"en-CA"=>"Budget",
        #         :"en-GB"=>"Budget",
        #         :"es-CL"=>"Presupuesto",
        #         :"es-ES"=>"Presupuesto",
        #         :"fr-BE"=>"Budget",
        #         :"fr-FR"=>"Budget",
        #         :"hr-HR"=>"Proračun",
        #         :"hu-HU"=>"Budget",
        #         :"it-IT"=>"Bilancio",
        #         :"kl-GL"=>"Missingersuusiaq",
        #         :"lb-LU"=>"Budget",
        #         :"lv-LV"=>"Budžets",
        #         :"nb-NO"=>"Budsjett",
        #         :"nl-BE"=>"Bedrag",
        #         :"nl-NL"=>"Bedrag",
        #         :"pl-PL"=>"Budżet",
        #         :"pt-BR"=>"Orçamento",
        #         :"ro-RO"=>"Buget",
        #         :"sr-SP"=>"Буџет",
        #         :"sv-SE"=>"Budget",
        #         :"tr-TR"=>"Bütçe",
        #         :"sr-Latn"=>"Budžet"},
        #       :required=>false,
        #       :ordering=>4,
        #       :enabled=>true,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.342Z",
        #       :updated_at=>"2023-01-13T09:41:18.342Z",
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"504d7a10-136c-4003-aa11-bf5580db145a",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"proposed_budget",
        #       :input_type=>"number",
        #       :title_multiloc=>
        #        {:en=>"Proposed Budget",
        #         :mi=>"Proposed Budget",
        #         :"ar-MA"=>"الميزانية المُقترحة",
        #         :"ar-SA"=>"الميزانية المُقترحة",
        #         :"ca-ES"=>"Proposed Budget",
        #         :"da-DK"=>"Estimeret Budget",
        #         :"de-DE"=>"Vorgeschlagenes Budget",
        #         :"el-GR"=>"Proposed Budget",
        #         :"en-CA"=>"Proposed Budget",
        #         :"en-GB"=>"Proposed Budget",
        #         :"es-CL"=>"Proyecto de presupuesto",
        #         :"es-ES"=>"Proyecto de presupuesto",
        #         :"fr-BE"=>"Proposition de budget",
        #         :"fr-FR"=>"Proposition de budget",
        #         :"hr-HR"=>"Predloženi proračun",
        #         :"hu-HU"=>"Proposed Budget",
        #         :"it-IT"=>"Bilancio proposto",
        #         :"kl-GL"=>"Proposed Budget",
        #         :"lb-LU"=>"Proposéierte Budget",
        #         :"lv-LV"=>"Ierosinātais budžets",
        #         :"nb-NO"=>"Proposed Budget",
        #         :"nl-BE"=>"Voorgesteld budget",
        #         :"nl-NL"=>"Voorgesteld budget",
        #         :"pl-PL"=>"Proponowany budżet",
        #         :"pt-BR"=>"Orçamento proposto",
        #         :"ro-RO"=>"Buget propus",
        #         :"sr-SP"=>"Предложени буџет",
        #         :"sv-SE"=>"Budgetförslag",
        #         :"tr-TR"=>"Öngörülen Bütçe",
        #         :"sr-Latn"=>"Predloženi budžet"},
        #       :required=>false,
        #       :ordering=>5,
        #       :enabled=>false,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.363Z",
        #       :updated_at=>"2023-01-13T09:41:18.363Z",
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"0881cd6b-d056-49b9-969f-18d2a8c1b3d9",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"tags",
        #       :input_type=>"multiselect",
        #       :title_multiloc=>
        #        {:en=>"Tags",
        #         :mi=>"Topics",
        #         :"ar-MA"=>"الموضوعات",
        #         :"ar-SA"=>"الموضوعات",
        #         :"ca-ES"=>"Etiquetes",
        #         :"da-DK"=>"Emner",
        #         :"de-DE"=>"Themen",
        #         :"el-GR"=>"Ετικέτες",
        #         :"en-CA"=>"Tags",
        #         :"en-GB"=>"Tags",
        #         :"es-CL"=>"Temas",
        #         :"es-ES"=>"Temas",
        #         :"fr-BE"=>"Étiquettes",
        #         :"fr-FR"=>"Étiquettes",
        #         :"hr-HR"=>"Oznake",
        #         :"hu-HU"=>"Topics",
        #         :"it-IT"=>"Argomenti",
        #         :"kl-GL"=>"Pineqartut",
        #         :"lb-LU"=>"Sujeten",
        #         :"lv-LV"=>"Tagi",
        #         :"nb-NO"=>"Emner",
        #         :"nl-BE"=>"Tags",
        #         :"nl-NL"=>"Tags",
        #         :"pl-PL"=>"Tematy",
        #         :"pt-BR"=>"Tópicos",
        #         :"ro-RO"=>"Subiecte",
        #         :"sr-SP"=>"Теме",
        #         :"sv-SE"=>"Topics",
        #         :"tr-TR"=>"Etiketler",
        #         :"sr-Latn"=>"Tema"},
        #       :required=>true,
        #       :ordering=>6,
        #       :enabled=>true,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.388Z",
        #       :updated_at=>"2023-01-13T09:41:18.388Z",
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"744e607f-8d7a-426e-bb8e-089a3157aad2",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"location",
        #       :input_type=>"text",
        #       :title_multiloc=>
        #        {:en=>"Location",
        #         :mi=>"Location",
        #         :"ar-MA"=>"الموقع",
        #         :"ar-SA"=>"الموقع",
        #         :"ca-ES"=>"Ubicació",
        #         :"da-DK"=>"Beliggenhed",
        #         :"de-DE"=>"Standort",
        #         :"el-GR"=>"Τοποθεσία",
        #         :"en-CA"=>"Location",
        #         :"en-GB"=>"Location",
        #         :"es-CL"=>"Ubicación",
        #         :"es-ES"=>"Ubicación",
        #         :"fr-BE"=>"Adresse",
        #         :"fr-FR"=>"Adresse",
        #         :"hr-HR"=>"Lokacija",
        #         :"hu-HU"=>"Location",
        #         :"it-IT"=>"Posizione",
        #         :"kl-GL"=>"Sumi",
        #         :"lb-LU"=>"Standuert",
        #         :"lv-LV"=>"Atrašanās vieta",
        #         :"nb-NO"=>"Lokalitet",
        #         :"nl-BE"=>"Locatie",
        #         :"nl-NL"=>"Locatie",
        #         :"pl-PL"=>"Lokalizacja",
        #         :"pt-BR"=>"Localização",
        #         :"ro-RO"=>"Locație",
        #         :"sr-SP"=>"Локација",
        #         :"sv-SE"=>"Plats",
        #         :"tr-TR"=>"Konum",
        #         :"sr-Latn"=>"Lokacija"},
        #       :required=>false,
        #       :ordering=>7,
        #       :enabled=>true,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.411Z",
        #       :updated_at=>"2023-01-13T09:41:18.411Z",
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"e3c48b00-049b-43e2-968c-69f183a32dca",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"images",
        #       :input_type=>"image_files",
        #       :title_multiloc=>
        #        {:en=>"Images",
        #         :mi=>"Images",
        #         :"ar-MA"=>"الصور",
        #         :"ar-SA"=>"الصور",
        #         :"ca-ES"=>"Images",
        #         :"da-DK"=>"Billeder",
        #         :"de-DE"=>"Bilder",
        #         :"el-GR"=>"Images",
        #         :"en-CA"=>"Images",
        #         :"en-GB"=>"Images",
        #         :"es-CL"=>"Imágenes",
        #         :"es-ES"=>"Imágenes",
        #         :"fr-BE"=>"Images",
        #         :"fr-FR"=>"Images",
        #         :"hr-HR"=>"Slike",
        #         :"hu-HU"=>"Images",
        #         :"it-IT"=>"Immagini",
        #         :"kl-GL"=>"Assit",
        #         :"lb-LU"=>"Biller",
        #         :"lv-LV"=>"Attēli",
        #         :"nb-NO"=>"Bilder",
        #         :"nl-BE"=>"Afbeeldingen",
        #         :"nl-NL"=>"Afbeeldingen",
        #         :"pl-PL"=>"Zdjęcia",
        #         :"pt-BR"=>"Imagens",
        #         :"ro-RO"=>"Imagini",
        #         :"sr-SP"=>"Слике",
        #         :"sv-SE"=>"Bilder",
        #         :"tr-TR"=>"Görseller",
        #         :"sr-Latn"=>"Slike"},
        #       :required=>false,
        #       :ordering=>8,
        #       :enabled=>true,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.434Z",
        #       :updated_at=>"2023-01-13T09:41:18.434Z",
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"f029c399-8521-418c-81d8-ece7e392f7b9",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"attachments",
        #       :input_type=>"files",
        #       :title_multiloc=>
        #        {:en=>"Attachments",
        #         :mi=>"Attachments",
        #         :"ar-MA"=>"المُرفقات",
        #         :"ar-SA"=>"المُرفقات",
        #         :"ca-ES"=>"Adjunts",
        #         :"da-DK"=>"Vedhæftede filer",
        #         :"de-DE"=>"Anhänge",
        #         :"el-GR"=>"Συνημμένα αρχεία",
        #         :"en-CA"=>"Other files",
        #         :"en-GB"=>"Other files",
        #         :"es-CL"=>"Archivos adjuntos",
        #         :"es-ES"=>"Archivos adjuntos",
        #         :"fr-BE"=>"Pièces jointes",
        #         :"fr-FR"=>"Pièces jointes",
        #         :"hr-HR"=>"Privici",
        #         :"hu-HU"=>"Other files",
        #         :"it-IT"=>"Allegati",
        #         :"kl-GL"=>"Filit ilanngussat",
        #         :"lb-LU"=>"Annexen",
        #         :"lv-LV"=>"Pielikumi",
        #         :"nb-NO"=>"Vedlegg",
        #         :"nl-BE"=>"Bijlagen",
        #         :"nl-NL"=>"Bijlagen",
        #         :"pl-PL"=>"Załączniki",
        #         :"pt-BR"=>"Anexos",
        #         :"ro-RO"=>"Fișiere atașate",
        #         :"sr-SP"=>"Прилози",
        #         :"sv-SE"=>"Bilagor",
        #         :"tr-TR"=>"Ekler",
        #         :"sr-Latn"=>"Prilozi"},
        #       :required=>false,
        #       :ordering=>9,
        #       :enabled=>true,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.457Z",
        #       :updated_at=>"2023-01-13T09:41:18.457Z",
        #       :logic=>{},
        #       :description_multiloc=>{}},
        #     :relationships=>{:options=>{:data=>[]}}},
        #    {:id=>"e1299971-5031-4bf5-9cc1-73e1b33772cd",
        #     :type=>"custom_field",
        #     :attributes=>
        #      {:key=>"select_field_title",
        #       :input_type=>"select",
        #       :title_multiloc=>{:en=>"Select field title"},
        #       :required=>false,
        #       :ordering=>10,
        #       :enabled=>true,
        #       :code=>nil,
        #       :created_at=>"2023-01-13T09:41:18.477Z",
        #       :updated_at=>"2023-01-13T09:41:18.477Z",
        #       :logic=>{},
        #       :description_multiloc=>{:en=>"Select field description"}},
        #     :relationships=>
        #      {:options=>
        #        {:data=>
        #          [{:id=>"2970b99c-0233-4e6e-8d96-973b15646491",
        #            :type=>"custom_field_option"},
        #           {:id=>"641b311c-43a2-45e4-8030-823a3aa4bc21",
        #            :type=>"custom_field_option"}]}}}],
        #  :included=>
        #   [{:id=>"2970b99c-0233-4e6e-8d96-973b15646491",
        #     :type=>"custom_field_option",
        #     :attributes=>
        #      {:key=>"field_1",
        #       :title_multiloc=>{:en=>"Field 1"},
        #       :ordering=>0,
        #       :created_at=>"2023-01-13T09:41:18.501Z",
        #       :updated_at=>"2023-01-13T09:41:18.501Z"}},
        #    {:id=>"641b311c-43a2-45e4-8030-823a3aa4bc21",
        #     :type=>"custom_field_option",
        #     :attributes=>
        #      {:key=>"field_2",
        #       :title_multiloc=>{:en=>"Field 2"},
        #       :ordering=>1,
        #       :created_at=>"2023-01-13T09:41:18.517Z",
        #       :updated_at=>"2023-01-13T09:41:18.517Z"}}]}
      end

      example 'Updating custom fields when there are responses' do
        create :idea, project: context
        custom_title = { 'en' => 'Custom title' }

        do_request(
          custom_fields: default_fields_param.tap do |params|
            params[1][:title_multiloc] = custom_title
          end
        )

        assert_status 200
        expect(context.reload.custom_form.custom_fields[1].title_multiloc).to eq custom_title
      end
    end
  end
end
