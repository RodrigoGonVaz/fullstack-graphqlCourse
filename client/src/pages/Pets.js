import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'
import icon from './saturn.svg'


const PETS_FIELDS = gql`
  fragment PetsFields on Pet {
      id
      name 
      type
      img
      vax @client
      owner {
        id
        age @client
      }
    }
`

const ALL_PETS = gql`
  query AllPets {
    mascotas: pets{
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`

// const ALL_PETS = gql`
//   query AllPets {
//     mascotas: pets{
//       id
//       name 
//       type
//       img
//       owner {
//         id
//         age @client
//       }
//     }
// }
// `

const NEW_PET = gql`
  mutation CreateAPet($newPet: NewPetInput!) { 
    addPet(input: $newPet) {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`

// const NEW_PET = gql`
// # CreateAPet - opration name (podemos llamarlo como queramos)
// # Declaramos variables con un tipo de NewPetInput! - es requerido el imput argument 

//   mutation CreateAPet($newPet: NewPetInput!) { 
//     addPet(input: $newPet) {
//       id
//       name 
//       type
//       img
//     }
// }
// `



export default function Pets () {
  // STATE = modal y Funcion que modifica el STATE=  setModal 
  const [modal, setModal] = useState(false)
  const {data, loading, error} = useQuery(ALL_PETS) // LOADING es un boolean y no trabaja como el await
  // para luego usar newPet.data, newPet.loading, newPet.error o podriamos reescribir las variables {data: d, loading: l, error: e}
  //const [createPet, newPet] =useMutation(NEW_PET) - se agrega la mascota pero no se renderiza automaticamente en ALL_PETS
  const [createPet, newPet] =useMutation(NEW_PET, { //update se activa una vez que el primer argumento es pasado - NEW_PET
    update(cache, {data: { addPet }}){
      const { mascotas } = cache.readQuery({ query: ALL_PETS })
      cache.writeQuery({
        query: ALL_PETS,
        data: {mascotas: [addPet, ...mascotas]},
      })
    },
  }) 
  
  
  //Al poner optimisticResponse en createPet podemos acceder a las variables del input del nombre y tipo... 
  const onSubmit = input => { // tyoe and name para el animal - createPet({variables})
    setModal(false)
    createPet({
      variables: {newPet: input},
      optimisticResponse: {
        __typename: 'Mutation',
        addPet: {
          id: Math.floor(Math.random() *1000) + '',
          name: input.name, 
          type: input.type,
          img: `https://via.placeholder.com/300`,
          __typename: "Pet"
      }
    }})
  }
//if (loading || newPet.loading) --> si queremos un spiner en newPet
  if (loading) {
    return <Loader />
  }

  if (error || newPet.error) {
    return <p>error!</p>
  }

  console.log(data.mascotas[0])
  
  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.mascotas}/>
      </section>
    </div>
  )
}
