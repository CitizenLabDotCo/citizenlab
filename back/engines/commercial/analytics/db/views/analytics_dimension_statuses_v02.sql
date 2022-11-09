SELECT id, title_multiloc, code, color FROM idea_statuses

UNION ALL

SELECT id, title_multiloc, code, color FROM initiative_statuses;
