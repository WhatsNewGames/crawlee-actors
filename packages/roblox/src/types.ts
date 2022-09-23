export interface JSONData {
  topic_list: {
    per_page: number;
    more_topics_url?: string;
    topics: JSONTopic[];
  };
}

export interface JSONTopic {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  pinned: boolean;
}
