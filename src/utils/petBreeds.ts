// Pet types and their common breeds, used to power the cascading
// Pet Type -> Breed selection in the Register/Edit Pet form.

export const PET_TYPES: string[] = ['Dog', 'Cat', 'Bird', 'Reptile', 'Exotic', 'Rabbit', 'Avion', 'Horse'];

export const BREEDS_BY_PET_TYPE: Record<string, string[]> = {
  Dog: [
    'Labrador Retriever',
    'Golden Retriever',
    'German Shepherd',
    'Pug',
    'Beagle',
    'Rottweiler',
    'Doberman',
    'Shih Tzu',
    'Pomeranian',
    'Indian Pariah (Desi)',
    'Great Dane',
    'Boxer',
    'Husky',
    'Mixed Breed',
    'Other'
  ],
  Cat: [
    'Persian',
    'Siamese',
    'Maine Coon',
    'Bengal',
    'British Shorthair',
    'Ragdoll',
    'Sphynx',
    'Indian Domestic (Desi)',
    'Himalayan',
    'Mixed Breed',
    'Other'
  ],
  Bird: [
    'Budgerigar (Budgie)',
    'Cockatiel',
    'Lovebird',
    'Parakeet',
    'African Grey Parrot',
    'Macaw',
    'Cockatoo',
    'Canary',
    'Finch',
    'Pigeon',
    'Other'
  ],
  Reptile: [
    'Bearded Dragon',
    'Iguana',
    'Gecko',
    'Chameleon',
    'Turtle',
    'Tortoise',
    'Ball Python',
    'Corn Snake',
    'Monitor Lizard',
    'Other'
  ],
  Exotic: [
    'Hamster',
    'Guinea Pig',
    'Ferret',
    'Hedgehog',
    'Chinchilla',
    'Sugar Glider',
    'Gerbil',
    'Other'
  ],
  Rabbit: [
    'Holland Lop',
    'Netherland Dwarf',
    'Rex',
    'Angora',
    'Dutch',
    'Flemish Giant',
    'Indian Desi Rabbit',
    'Other'
  ],
  Avion: ['Chicken', 'Duck', 'Turkey', 'Goose', 'Peacock', 'Quail', 'Other'],
  Horse: ['Arabian', 'Thoroughbred', 'Marwari', 'Kathiawari', 'Pony', 'Mustang', 'Other']
};

export function getBreedsForPetType(petType: string): string[] {
  return BREEDS_BY_PET_TYPE[petType] || ['Mixed Breed', 'Other'];
}
