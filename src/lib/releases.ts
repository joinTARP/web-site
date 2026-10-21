import { getCollection } from 'astro:content';

export async function getReleases() {
  const releases = await getCollection('releases');
  return releases.sort((a, b) =>
    b.data.version.localeCompare(a.data.version, 'en', { numeric: true }),
  );
}
