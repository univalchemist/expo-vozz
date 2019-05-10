import gql from 'graphql-tag';
export const USER_EXPERIENCE_QUERY = gql`query experiences($id: ID!) {
    experiences(where: {user: $id}) {
        _id
        title
        image{url}
        description
        user{_id, username}
        moments{_id}
        comments{_id}
        likes{_id}
        plays{_id, own_user, count}
      }
}`;

export const GET_EXPERIENCE_QUERY = gql`query experience($id: ID!) {
    experience(id: $id) {
      _id
      title
      description
      image{url}
      user{_id, username}
      comments{_id, message, user{_id, username}}
      likes{_id, user{_id}, experience{_id}}
      tags{_id, name}
      plays{_id, user{_id, username}, route{_id}, own_user, count}
      moments{_id, ultimas, audio{_id, url}, user{_id, username}, title, tags{_id, name}}
    }
}`;

export const EXPERIENCES_QUERY = gql`query experiences {
  experiences {
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
}`;
export const EXPERIENCES_SEARCH_QUERY = gql`query experiences($search: String!) {
  experiences(where: {title: $search}) {
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
}`;