export interface JSONData {
  data: {
    list: JSONArticle[];
  };
}

export interface JSONArticle {
  contentId: string;
}

export interface JSONDataNote {
  data: JSONArticleNote;
}

export interface JSONArticleNote {
  contentId: string;
  title: string;
  content: string;
  start_time: string;
}
