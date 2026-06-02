# frozen_string_literal: true

module DecidimImporter
  # Synthetic Decidim rows used to exercise extractors and pipeline pieces that have no real CSV
  # fixture yet (projects, phases, process_roles). Schemas mirror the matching extractor `COLUMNS`
  # constants — update both together when real exports for those models land.
  module SampleData
    module_function

    def users
      [
        { 'uid' => 'decidim-user-1', 'name' => 'Marie Curie', 'email' => 'marie@example.fr',
          'confirmed_at' => '2020-01-01 10:00', 'locale' => 'fr',
          'about' => 'Chercheuse', 'personal_url' => 'https://marie.example.fr',
          'admin' => 'true', 'created_at' => '2020-01-01 10:00',
          'extended_data' => '{"gender":"female","date_of_birth":"1967-11-07"}' },
        { 'uid' => 'decidim-user-2', 'name' => 'Henri Dupont', 'email' => 'henri@example.fr',
          'confirmed_at' => '2020-02-01 10:00', 'locale' => 'fr',
          'admin' => 'false', 'created_at' => '2020-02-01 10:00',
          'extended_data' => '{"gender":"male"}' }
      ]
    end

    def folders
      [
        { 'uid' => 'decidim-participatoryprocessgroup-10', 'title' => 'Environnement',
          'description' => '<p>Tous les projets verts.</p>', 'hero_image' => '',
          'created_at' => '2020-01-01', 'updated_at' => '2020-01-01' }
      ]
    end

    def projects
      [
        { 'uid' => 'decidim-participatoryprocess-100', 'title' => 'Budget participatif 2021',
          'description' => '<p>Proposez vos projets.</p>',
          'short_description' => 'Le budget participatif annuel',
          'hero_image' => '',
          'decidim_participatory_process_group' => 'decidim-participatoryprocessgroup-10',
          'published_at' => '2021-01-01', 'created_at' => '2021-01-01',
          'updated_at' => '2021-01-01' },
        { 'uid' => 'decidim-participatoryprocess-101', 'title' => 'Concertation mobilité',
          'description' => '<p>Repensons la mobilité.</p>',
          'short_description' => 'Mobilité douce',
          'hero_image' => '',
          'decidim_participatory_process_group' => '',
          'published_at' => '', 'created_at' => '2021-02-01', 'updated_at' => '2021-02-01' }
      ]
    end

    def phases
      [
        { 'uid' => 'decidim-step-1000', 'decidim_participatory_process' => 'decidim-participatoryprocess-100',
          'title' => 'Dépôt des projets', 'description' => '<p>Phase de dépôt.</p>',
          'start_date' => '2021-01-01', 'end_date' => '2021-02-01', 'position' => '1' },
        { 'uid' => 'decidim-step-1001', 'decidim_participatory_process' => 'decidim-participatoryprocess-100',
          'title' => 'Vote', 'description' => '<p>Phase de vote.</p>',
          'start_date' => '2021-02-02', 'end_date' => '2021-03-01', 'position' => '2' },
        # No dates — must be skipped and reported.
        { 'uid' => 'decidim-step-1002', 'decidim_participatory_process' => 'decidim-participatoryprocess-100',
          'title' => 'Étape sans dates', 'description' => '<p>?</p>',
          'start_date' => '', 'end_date' => '', 'position' => '3' }
      ]
    end

    def process_roles
      [
        { 'decidim_user' => 'decidim-user-2',
          'decidim_participatory_process' => 'decidim-participatoryprocess-100',
          'role' => 'admin' }
      ]
    end

    def all
      {
        users: users,
        folders: folders,
        projects: projects,
        phases: phases,
        process_roles: process_roles
      }
    end
  end
end
