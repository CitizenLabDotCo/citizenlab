class ProjectCopyService

  def import template
    # template is a hash
    ActiveRecord::Base.transaction do
      TenantTemplateService.new.apply_template template
    end
  end

  def export project
    project_ref = { 'title_multiloc'               => project.title_multiloc,
                    'description_multiloc'         => project.description_multiloc,
                    'remote_header_bg_url'         => project.header_bg_url,
                    'visible_to'                   => project.visible_to,
                    'description_preview_multiloc' => project.description_preview_multiloc,
                    'presentation_mode'            => project.presentation_mode,
                    'participation_method'         => project.participation_method,
                    'process_type'                 => project.process_type,
                    'internal_role'                => project.internal_role,
                    'publication_status'           => project.publication_status,
                    'posting_enabled'              => project.posting_enabled,
                    'commenting_enabled'           => project.commenting_enabled,
                    'voting_enabled'               => project.voting_enabled,
                    'voting_method'                => project.voting_method,
                    'voting_limited_max'           => project.voting_limited_max,
                    'survey_embed_url'             => project.survey_embed_url,
                    'survey_service'               => project.survey_service
                  }
    template = { 
      'models' => {
        'project' => [project_ref],

        'project_image' => project.project_images.map{ |pi|
          {
            'project_ref'      => project_ref,
            'remote_image_url' => pi.image_url,
            'ordering'         => pi.ordering
          }
        },
        'phase' => project.phases.map{ |p|
          {
            'title_multiloc'       => p.title_multiloc,
            'description_multiloc' => p.description_multiloc,
            'project_ref'          => project_ref,
            'start_at'             => p.start_at,
            'end_at'               => p.end_at,
            'participation_method' => p.participation_method,
            'posting_enabled'      => p.posting_enabled,
            'commenting_enabled'   => p.commenting_enabled,
            'voting_enabled'       => p.voting_enabled,
            'voting_method'        => p.voting_method,
            'voting_limited_max'   => p.voting_limited_max,
            'survey_embed_url'     => p.survey_embed_url,
            'survey_service'       => p.survey_service
          }
        },
        'event' => project.events.map{ |e|
          {
            'title_multiloc'       => e.title_multiloc,
            'description_multiloc' => e.description_multiloc,
            'project_ref'          => project_ref,
            'start_at'             => e.start_at,
            'end_at'               => e.end_at,
            'location_multiloc'    => e.location_multiloc
          }
        },
        'project_file' => project.project_files.map{ |pf|
          {
            'project_ref'     => project_ref,
            'remote_file_url' => pf.file_url,
            'ordering'        => pf.ordering
          }
        }
      } 
    }
    template
  end

end