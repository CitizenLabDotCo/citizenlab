# frozen_string_literal: true

module DecidimImporter
  # Dummy Decidim export data with **assumed** column headers, used by specs and for local dev until
  # real exports land. Each entry is `[header_row, *data_rows]`, ready for
  # `XlsxService#xlsx_from_rows`. Headers mirror the `COLUMNS` maps in the extractors — update both
  # together when the real Decidim headers are confirmed.
  module SampleData
    module_function

    def users
      [
        %w[id name email confirmed_at deleted_at locale about personal_url avatar_url admin created_at gender birth_date],
        ['1', 'Marie Curie', 'marie@example.fr', '2020-01-01 10:00', '', 'fr', 'Chercheuse', 'https://marie.example.fr', '', 'true', '2020-01-01 10:00', 'female', '1967-11-07'],
        ['2', 'Henri Dupont', 'henri@example.fr', '2020-02-01 10:00', '', 'fr', '', '', '', 'false', '2020-02-01 10:00', 'male', '1980-05-20'],
        # Deleted/anonymised account — must be skipped.
        ['3', 'Compte Supprimé', 'gone@example.fr', '2020-03-01 10:00', '2021-01-01 10:00', 'fr', '', '', '', 'false', '2020-03-01 10:00', '', ''],
        # Unconfirmed email — must be skipped.
        ['4', 'Non Confirmé', 'pending@example.fr', '', '', 'fr', '', '', '', 'false', '2020-04-01 10:00', '', '']
      ]
    end

    # Decidim participatory process groups
    def folders
      [
        %w[id title description parent_id hero_image_url created_at updated_at],
        ['10', 'Environnement', '<p>Tous les projets verts.</p>', '', '', '2020-01-01', '2020-01-01']
      ]
    end

    # Decidim participatory processes
    def projects
      [
        %w[id title description short_description hero_image_url decidim_participatory_process_group_id published_at created_at updated_at],
        ['100', 'Budget participatif 2021', '<p>Proposez vos projets.</p>', 'Le budget participatif annuel', '', '10', '2021-01-01', '2021-01-01', '2021-01-01'],
        ['101', 'Concertation mobilité', '<p>Repensons la mobilité.</p>', 'Mobilité douce', '', '', '', '2021-02-01', '2021-02-01']
      ]
    end

    # Decidim participatory process steps
    def phases
      [
        %w[id decidim_participatory_process_id title description start_date end_date position],
        ['1000', '100', 'Dépôt des projets', '<p>Phase de dépôt.</p>', '2021-01-01', '2021-02-01', '1'],
        ['1001', '100', 'Vote', '<p>Phase de vote.</p>', '2021-02-02', '2021-03-01', '2'],
        # No dates — must be skipped and reported.
        ['1002', '100', 'Étape sans dates', '<p>?</p>', '', '', '3']
      ]
    end

    # Decidim participatory process user roles
    def process_roles
      [
        %w[decidim_user_id decidim_participatory_process_id role],
        %w[2 100 admin]
      ]
    end

    # All sample sheets keyed by importer model.
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
