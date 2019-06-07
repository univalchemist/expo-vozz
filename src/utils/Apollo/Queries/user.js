import gql from 'graphql-tag';
export const USER_QUERY = gql`query user($id: ID!) {
  user(id: $id) {
        _id
        username
        full_name
        email
        birthDay
        gender
        bio
        profile_base64
        countryCode
        phone
        countryName
        comments{_id, message, route{_id}, experience{_id}}
        experiences{_id, title, description, image{url}, comments{_id}, plays{_id}, moments{_id}, tags{_id}, likes{_id}, plays{_id, count}}
        moments{_id}
        followings{_id}
        followedBys{_id}
        routes{_id, title, description, image{url}, comments{_id}, plays{_id}, moments{_id}, tags{_id}, likes{_id}, plays{_id, count}}
        categories{_id}
        likes{_id}
        plays{_id}
      }
}`;
export const USERS_SEARCH_QUERY = gql`query users($search: String!) {
  users(where: {username_contains: $search}) {
        _id
        username
        full_name
        email
        birthDay
        gender
        bio
        profile_base64
        countryCode
        phone
        countryName
        pushToken
        comments{_id, message, route{_id}, experience{_id}}
        experiences{_id, title, description, image{url}, comments{_id}, plays{_id}, moments{_id}, tags{_id}, likes{_id}}
        moments{_id}
        followings{_id}
        followedBys{_id}
        routes{_id, title, description, image{url}, comments{_id}, plays{_id}, moments{_id}, tags{_id}, likes{_id}}
        categories{_id}
        likes{_id}
        plays{_id}
      }
}`;

export const CHAT_USERS_QUERY = gql`query users {
  users {
        _id
        username
        full_name
        email
        birthDay
        gender
        bio
        profile_base64
        countryCode
        phone
        countryName
      }
}`;

export const USERS_QUERY = gql`query users {
  users {
        _id
        username
        full_name
        email
        birthDay
        gender
        bio
        profile_base64
        countryCode
        phone
        countryName
        comments{_id, message, route{_id}, experience{_id}}
        experiences{_id, title, description, image{url}, comments{_id}, plays{_id}, moments{_id}, tags{_id}, likes{_id}}
        moments{_id}
        followings{_id}
        followedBys{_id}
        routes{_id, title, description, image{url}, comments{_id}, plays{_id}, moments{_id}, tags{_id}, likes{_id}}
        categories{_id}
        likes{_id}
        plays{_id}
      }
}`;
export const TRENDS_QUERY = gql`query user($id: ID!) {
  user(id: $id) {
        _id
        username
        routes{
          _id, 
          title, 
          image{url}, 
          description, 
          comments{_id}, 
          likes{_id}, 
          tags{_id}, 
          plays{_id, count}
          moments{_id},
          user{_id, username},
          createdAt,
          updatedAt
        }
        experiences{
          _id, 
          title, 
          image{url}, 
          description, 
          comments{_id}, 
          likes{_id}, 
          tags{_id}, 
          plays{_id, count}
          moments{_id},
          user{_id, username},
          createdAt,
          updatedAt
        }
      }
}`;
export const CHAT_LIST_USERS = gql`query users($ids: [String!]) {
  users(where: {_id: $ids}) {
        _id
        username
        full_name
        pushToken
        profile_base64
      }
}`;