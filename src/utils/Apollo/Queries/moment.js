import gql from 'graphql-tag';
import Moment from 'moment';
export const USER_MOMENT_QUERY = gql`query moments($id: ID!) {
    moments(where: {user: $id}) {
        _id
        title
        updatedAt
        createdAt
        user {_id, username}
        audio {url}
      }
}`;

export const LAST_MOMENT_QUERY = gql`query moments($id: ID!) {
  moments(where: {user: $id, createdAt_gt: "${ Moment().subtract(1, "days").toISOString()}"}) {
      _id
      title
      updatedAt
      createdAt
      user {_id, username}
      audio {url}
    }
}`;