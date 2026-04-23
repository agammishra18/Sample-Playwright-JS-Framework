import { faker } from '@faker-js/faker';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Product {
  name: string;
  sku: string;
  price: number;
  description: string;
}

export class DataFactory {
  static user(overrides: Partial<User> = {}): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: `Pass@${faker.string.alphanumeric(8)}`,
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
      ...overrides,
    };
  }

  static address(overrides: Partial<Address> = {}): Address {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
      ...overrides,
    };
  }

  static product(overrides: Partial<Product> = {}): Product {
    return {
      name: faker.commerce.productName(),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      price: Number(faker.commerce.price({ min: 5, max: 500 })),
      description: faker.commerce.productDescription(),
      ...overrides,
    };
  }
}
