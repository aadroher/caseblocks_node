const faker = require('faker')
const Factory = require('rosie').Factory
const fs = require('fs')
const _ = require('underscore')

const fixturesPath = `${__dirname}/../support/fixtures`

// Load fixtures

const caseTypeFixtures = JSON.parse(
  fs.readFileSync(`${fixturesPath}/case_types.json`)
)

const caseFixtures = JSON.parse(
  fs.readFileSync(`${fixturesPath}/cases.json`)
)

const peopleFixtures = caseFixtures.filter(caseInstance => caseInstance.case_type === 'Person')
const weaponsFixtures = caseFixtures.filter(caseInstance => caseInstance.case_type === 'Weapon')

const relationshipFixtures = JSON.parse(
  fs.readFileSync(`${fixturesPath}/relationships.json`)
)

// ####################
// Case type collection
// ####################

const caseTypes = caseTypeFixtures


// #################
// People collection
// #################

const peopleNumber = 200

function getPeopleFactory() {

  let peopleFactory = Factory.define('person')

  const idFields = ['_id']

  // Build upon the first fixture.
  Object.getOwnPropertyNames(peopleFixtures[0]).forEach(fieldName => {

    if (idFields.includes(fieldName)) {

      peopleFactory.sequence(fieldName, i => (2 + i).toString())

    } else if (fieldName === 'first_name') {

      peopleFactory.attr(fieldName, () => faker.name.firstName())

    } else if (fieldName === 'last_name') {

      peopleFactory.attr(fieldName, () => faker.name.lastName())

    } else if (fieldName === 'email') {

      peopleFactory.attr(fieldName, ['first_name', 'last_name'], (first_name, last_name) =>
        `${first_name}_${last_name}@${faker.internet.domainName()}`
      )

    } else if (['title', '_title'].includes(fieldName)) {

      peopleFactory.attr(fieldName, ['first_name', 'last_name'], (first_name, last_name) =>
        `${first_name} ${last_name}`
      )

    } else if (fieldName === 'person_reference') {

      peopleFactory.sequence(fieldName, (i) => i + 2)

    } else {

      peopleFactory.attr(fieldName, peopleFixtures[0][fieldName])

    }

  })

  return peopleFactory

}


const peopleFactory = getPeopleFactory()
const genericPeople = peopleFactory.buildList(peopleNumber)



// #################
// Weapon collection
// #################

const weaponsNumber = 300

const weaponNames = [
  'Blaster Rifle',
  'Bowcaster',
  'Slugthrower',
  'Gaffidi Stick',
  'Electrostaff',
  'Vibro Pistol'
]

function getWeaponFactory() {

  let weaponFactory = Factory.define('weapon')

  const idFields = ['_id']

  // Build upon the first fixture.
  Object.getOwnPropertyNames(weaponsFixtures[0]).forEach(fieldName => {

    if (idFields.includes(fieldName)) {

      weaponFactory.sequence(fieldName, i => (3 + i).toString())

    } else if (fieldName === 'weapon_model') {

      weaponFactory.attr(fieldName, () =>
        `${faker.random.arrayElement(weaponNames)} `
        + faker.random.alphaNumeric().toUpperCase()
        + faker.random.alphaNumeric().toUpperCase()
        + `-${faker.random.alphaNumeric().toUpperCase()}`
      )

    } else if (fieldName === 'weight') {

      weaponFactory.attr(fieldName, () => Math.floor(faker.random.number({
        min: 100,
        max: 10000,
        precision: 50
      })))

    } else if (['title', '_title'].includes(fieldName)) {

      weaponFactory.attr(fieldName, ['weapon_model'], weapon_model => weapon_model)

    } else if (fieldName === 'weapon_reference') {

      weaponFactory.sequence(fieldName, (i) => i + 2)

    } else if (fieldName === 'person_reference') {

      weaponFactory.attr(fieldName, null)

    } else {

      weaponFactory.attr(fieldName, peopleFixtures[0][fieldName])

    }

  })

  return weaponFactory

}

const weaponFactory = getWeaponFactory()
const genericWeapons = weaponFactory.buildList(weaponsNumber)

// ########################
// Relationships collection
// ########################

const relationships = relationshipFixtures

// ##############################
// Establish random relationships
// ##############################

const numWeaponOwners = Math.ceil(peopleNumber / 3)
const maxWeaponsPerOwner = 3

function relatePeopleAndWeapons({people, weapons}) {

  const weaponOwners = _.sample(people, numWeaponOwners)
  const nonWeaponOwners = people.filter(person =>
    !weaponOwners.includes(person)
  )

  const ownedWeapons = weaponOwners.reduce((assignedWeapons, person) => {

    const numWeapons = Math.ceil(maxWeaponsPerOwner * Math.random())
    const freeWeapons = weapons.filter(weapon =>
      !assignedWeapons.includes(weapon)
    )

    const personWeapons = _.sample(freeWeapons, numWeapons).map(weapon =>
      Object.assign(weapon, {
        person_reference: person.person_reference
      })
    )

    return [...assignedWeapons, ...personWeapons]

  }, [])

  const nonOwnedWeapons = weapons.filter(weapon =>
    !ownedWeapons.includes(weapon)
  )

  const updatedPeople = [...weaponOwners, ...nonWeaponOwners].sort(
    (a, b) => parseInt(a.id) - parseInt(b.id)
  )

  const updatedWeapons = [...ownedWeapons, ...nonOwnedWeapons].sort(
    (a, b) => parseInt(a.id) - parseInt(b.id)
  )

  return {
    people: updatedPeople,
    weapons: updatedWeapons
  }

}


const generatedData = relatePeopleAndWeapons({people: genericPeople, weapons: genericWeapons})

const people = peopleFixtures.concat(generatedData.people)
const weapons = weaponsFixtures.concat(generatedData.weapons)


module.exports = {
  caseTypes,
  people,
  weapons,
  relationships
}


