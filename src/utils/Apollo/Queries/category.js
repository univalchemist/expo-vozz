import gql from 'graphql-tag';
export const ALL_CATEGORY_QUERY = gql `query categories {
    categories {
        _id
        title
        description
        picture{url}
        tags{_id}
        users{_id}
        featured
      }
}`;