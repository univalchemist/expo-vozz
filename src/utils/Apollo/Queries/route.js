import gql from 'graphql-tag';
export const USER_ROUTE_QUERY = gql`query routes($id: ID!) {
    routes(where: {user: $id}) {
        _id
        title
        image{url}
        borrador
        description
        user{_id, username}
        moments{_id}
        comments{_id}
        likes{_id}
        plays{_id, own_user, count}
      }
}`;

export const GET_ROUTE_QUERY = gql`query route($id: ID!) {
  route(id: $id) {
      _id
      title
      description
      image{url}
      user{_id, username}
      markers
      comments{_id, message, user{_id, username}}
      likes{_id, user{_id}, route{_id}}
      tags{_id, name}
      plays{_id, user{_id, username}, route{_id}, own_user, count}
      moments{_id, ultimas, audio{_id, url}, user{_id, username}, title, tags{_id, name}}
    }
}`;

export const ROUTES_QUERY = gql`query routes {
  routes {
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
}`;
export const ROUTES_SEARCH_QUERY = gql`query routes($search: String!) {
  routes(where: {title: $search}) {
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
}`;