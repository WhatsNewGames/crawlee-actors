/**
 * Only interesting fields are typed
 */
export interface JSONData {
  result: {
    data: {
      articles: {
        nodes: ReadonlyArray<JSONDataNode>;
      };
    };
  };
}

export interface JSONDataNode {
  date: string;
  uid: string;
  title: string;
  description: string;
  article_type: string;
  url: {
    url: string;
  };
  external_link: string;
  youtube_link: string;
  banner: {
    url: string;
    uid: string;
  };
  category: ReadonlyArray<JSONDataCategory>;
  author: ReadonlyArray<JSONDataAuthor>;
  article_tags: ReadonlyArray<JSONDataTag>;
}

export interface JSONDataCategory {
  title: string;
  uid: string;
}

export interface JSONDataAuthor {
  title: string;
}

export interface JSONDataTag {
  uid: string;
  title: string;
  machine_name: string;
  is_hidden: boolean | null;
  url: {
    url: string;
  };
}
