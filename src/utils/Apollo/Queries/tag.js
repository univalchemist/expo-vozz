import gql from 'graphql-tag';
export const TAG_QUERY = gql `query tags($name: String!) {
    tags(where: {name: $name}) {
        _id
        name
      }
}`;

export const SEARCH_CATEGORY_QUERY = gql `query tag($id: ID!) {
  tag(id: $id) {
      _id
      name
      experiences{
        _id
        title
        image{url}
        description
        user{username, _id}
        moments{_id}
        comments{_id}
        likes{_id}
        plays{_id, own_user, count}
      }
      routes{
        _id
        title
        image{url}
        borrador
        description
        user{username, _id}
        moments{_id}
        comments{_id}
        likes{_id}
        plays{_id, own_user, count}
      }
    }
}`;
