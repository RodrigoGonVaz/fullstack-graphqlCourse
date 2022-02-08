import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'

/**
 * Create a new apollo client and export as default
 */

const typeDefs = gql`
    extend type User {
        age: Int
    }
    extend type Pet {
        vax: Boolean!
}
`
//Boolean! --> es requerido

const resolvers = {
    User: {
        age() {
            return 35
        }
    },
    Pet: {
        vax() {
            return true
        }
    }
}


const http = new HttpLink({uri: 'http://localhost:4000'})

const delay = setContext(
    request => {
        new Promise((success, fail) => {
            setTimeout(() => {
                success()
            }, 800)
        })
    }
)

const link = ApolloLink.from([
    delay,
    http
])

const cache = new InMemoryCache() 

const client = new ApolloClient({
    link,
    cache,
    resolvers,
    typeDefs
})

export default client


/*Para probar Apollo Client con la API de = https://rickandmortyapi.com/graphql
Creamos un Query
    const query = gql`
    {
        characters{
            results{
                id
                name
            }
        }
    }`

    client.query({query})
        .then(results => console.log(results))

// console.log(results) --> siempre la llave de un query es data
{data: {…}, loading: false, networkStatus: 7, stale: false}
Object
    data:
        characters:
            results: (20) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
            __typename: "Characters"
            [[Prototype]]: Object
            [[Prototype]]: Object
        loading: false
        networkStatus: 7
        stale: false

Ir al apollo dev tool en cache donde venos los characters con id y name

//Crear Mascotas - ejemplo en Apollo dev tool ( mutations will contain arguments to let the server know what to mutate.)
--Operation--
mutation CreatePet($newPet: NewPetInput!) {
  addPet(input: $newPet) {
    id
    name
    type
    img
  }
}
--Variables--
{ "newPet": {"name": "Batman", "type": "DOG"} }

--Results--
{
  "data": {
    "addPet": {
      "id": "JiSb7MJLKbv47Ht-oKMc2",
      "name": "Batman",
      "type": "DOG",
      "img": "https://placedog.net/300/300",
      "__typename": "Pet"
    }
  }
}


*/ 

