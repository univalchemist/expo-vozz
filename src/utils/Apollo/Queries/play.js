import gql from 'graphql-tag';
export const USER_PLAYS_QUERY = gql `query plays($id: String!) {
    plays(where: {own_user: $id}) {
        _id
        count
      }
}`;