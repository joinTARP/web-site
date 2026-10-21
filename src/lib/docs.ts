import { getCollection, type CollectionEntry } from 'astro:content';
import { docsSections } from '../data/site';

export type DocEntry = CollectionEntry<'docs'>;

export function sectionOf(entry: DocEntry) {
  return entry.id.split('/')[0];
}

export async function getSortedDocs() {
  const docs = await getCollection('docs');
  const sectionIndex = (entry: DocEntry) =>
    docsSections.findIndex((section) => section.id === sectionOf(entry));
  return docs.sort(
    (a, b) => sectionIndex(a) - sectionIndex(b) || a.data.order - b.data.order,
  );
}

export async function getDocsTree() {
  const docs = await getSortedDocs();
  return docsSections.map((section) => ({
    ...section,
    entries: docs.filter((entry) => sectionOf(entry) === section.id),
  }));
}

export const docHref = (entry: DocEntry) => `/docs/${entry.id}/`;
