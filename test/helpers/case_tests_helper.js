const faker = require('faker')
const Factory = require('rosie').Factory
const fs = require('fs')
const mongodb = require('mongodb')


const fixturesPath = `${__dirname}/../support/fixtures`
// Concrete instances:

const caseTypes = JSON.parse(
  fs.readFileSync(`${fixturesPath}/case_types.json`)
)

const concreteCases = JSON.parse(
  fs.readFileSync(`${fixturesPath}/cases.json`)
)

const concretePeople = concreteCases.filter(caseInstance => caseInstance.case_type === 'Person')
const concreteWeapons = concreteCases.filter(caseInstance => caseInstance.case_type === 'Weapon')

const relationships = JSON.parse(
  fs.readFileSync(`${fixturesPath}/relationships.json`)
)

// console.log({concretePeople, concreteWeapons, relationships, caseTypes})

const weaponNames = [
  'Blaster Rifle',
  'Bowcaster',
  'Slugthrower',
  'Gaffidi Stick',
  'Electrostaff',
  'Vibro Pistol'
]

// Functions to define factories.

function getPeopleFactory() {

  let peopleFactory = Factory.define('person')

  const idFields = ['_id']

  Object.getOwnPropertyNames(concretePeople[0]).forEach(fieldName => {

    if (idFields.includes(fieldName)) {

      peopleFactory.sequence(fieldName, () => new mongodb.ObjectID())

    } else if (fieldName === 'first_name') {

      peopleFactory.attr(fieldName, () => faker.name.firstName())

    } else if (fieldName === 'last_name') {

      peopleFactory.attr(fieldName, () => faker.name.lastName())

    } else if (fieldName === 'email') {

      peopleFactory.attr(fieldName, () => faker.internet.email())

    } else if (['title', '_title'].includes(fieldName)) {

      peopleFactory.attr(fieldName, ['first_name', 'last_name'], (first_name, last_name) =>
        `${first_name} ${last_name}`
      )

    } else if (fieldName === 'person_reference') {

      peopleFactory.sequence(fieldName, (i) => i + 2)

    } else {

      peopleFactory.attr(fieldName, concretePeople[0][fieldName])

    }

  })

  return peopleFactory

}


const peopleFactory = getPeopleFactory()

const genericPeople = peopleFactory.buildList(10)

console.log(genericPeople)


