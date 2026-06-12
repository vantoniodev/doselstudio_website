(function () {
  const CATALOG_URL = 'data/catalog.json';

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`failed to load ${url}: ${response.status}`);
    }
    return response.json();
  }

  function selectedDemoId(catalog) {
    const params = new URLSearchParams(window.location.search);
    return params.get('demo') || catalog.featured || catalog.items?.[0]?.id || '';
  }

  function itemById(catalog, id) {
    return (catalog.items || []).find((item) => item.id === id) || null;
  }

  function toLegacyMeta(demo) {
    return {
      id: demo.id,
      title: demo.title,
      author: demo.author,
      description: demo.description,
      lang_from: demo.lang_from,
      lang_to: demo.lang_to,
      duration: demo.duration,
      year: demo.year,
      source: demo.source,
      cover: demo.cover,
      track_en: demo.video || demo.tracks?.original?.src || '',
      track_pt: demo.tracks?.localized?.src || '',
      subtitles_en: demo.subtitles?.original || null,
      subtitles_pt: demo.subtitles?.localized || null,
      audio_processing: demo.audio_processing || null,
      track_labels: {
        en: demo.tracks?.original?.label || '',
        pt: demo.tracks?.localized?.label || ''
      }
    };
  }

  window.DoselCatalog = {
    CATALOG_URL,
    fetchJson,
    selectedDemoId,
    itemById,
    toLegacyMeta
  };
}());
