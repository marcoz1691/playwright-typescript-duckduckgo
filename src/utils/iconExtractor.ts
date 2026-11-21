import type { RelatedTopic, Topic, TopicGroup } from '../api/types/instantAnswer';

export interface IconEntry {
  topic: string;
  relativeUrl: string;
  absoluteUrl: string;
}

const isGroup = (item: RelatedTopic): item is TopicGroup => Array.isArray((item as TopicGroup).Topics);

/** Flattens RelatedTopics, descending into groups (e.g. "Characters", "Films") at any depth. */
export function flattenTopics(items: RelatedTopic[]): Topic[] {
  return items.flatMap((item) => (isGroup(item) ? flattenTopics(item.Topics) : [item]));
}

/**
 * Returns every icon whose URL is present. The API uses "" for "no icon" more often than null,
 * so both are treated as missing.
 */
export function extractIconUrls(items: RelatedTopic[], host: string): IconEntry[] {
  return flattenTopics(items)
    .filter((topic) => typeof topic.Icon?.URL === 'string' && topic.Icon.URL.trim() !== '')
    .map((topic) => {
      const relativeUrl = topic.Icon!.URL as string;
      return {
        topic: topic.Text,
        relativeUrl,
        absoluteUrl: new URL(relativeUrl, host).toString(),
      };
    });
}
