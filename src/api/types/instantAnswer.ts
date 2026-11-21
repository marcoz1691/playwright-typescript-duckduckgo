/**
 * Partial model of the DuckDuckGo Instant Answer API response.
 * Only the fields used by the tests are typed; the API returns many more.
 */
export interface Icon {
  URL: string | null;
  Height: string | number;
  Width: string | number;
}

export interface Topic {
  FirstURL: string;
  Text: string;
  Result: string;
  Icon?: Icon | null;
}

/** RelatedTopics can contain plain topics or named groups that nest more topics. */
export interface TopicGroup {
  Name: string;
  Topics: Topic[];
}

export type RelatedTopic = Topic | TopicGroup;

export interface InstantAnswerResponse {
  Heading: string;
  AbstractText: string;
  Image: string;
  Type: string;
  RelatedTopics: RelatedTopic[];
  Results: Topic[];
}
