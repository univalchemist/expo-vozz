import ApolloClient from 'apollo-boost'
import CONSTANTS from '../constantes';

const client = new ApolloClient({ uri:  `${CONSTANTS.URL_API_PRE}/graphql` })
export default client