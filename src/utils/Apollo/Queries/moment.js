import gql from 'graphql-tag';
export const USER_MOMENT_QUERY = gql `query moments($id: ID!) {
    moments(where: {user: $id}) {
        _id
        title
        updatedAt
        createdAt
        user {_id, username}
        audio {url}
      }
}`;